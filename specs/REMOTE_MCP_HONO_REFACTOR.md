# Remote MCP Hono Refactor Spec

## Goal

Refactor `apps/remote-mcp` from direct `Bun.serve` request handling to a Hono app.

The goal is not to reduce physical line count. The goal is to reduce cognitive overhead by replacing custom manual routing with a familiar HTTP routing abstraction.

## Motivation

The current remote MCP implementation is small, but its HTTP layer feels more custom than necessary:

```ts
if (new URL(request.url).pathname !== "/mcp") {
  return Response.json({ error: "Not found" }, { status: 404 });
}

Bun.serve({
  port,
  fetch: handleMcpRequest,
});
```

This asks tutorial viewers to understand Bun's server API, manual route matching, unsupported methods, and where future routes should be added.

Hono makes the HTTP intent explicit:

```ts
app.post("/mcp", async (c) => {
  return handleMcpRequest(c.req.raw);
});
```

This is more familiar to developers who have used web frameworks, even if the final implementation is not meaningfully shorter.

## Decision

Use Hono for the remote MCP HTTP layer.

Keep Bun as the runtime for local development and package scripts.

Do not move MCP tool registration or Telegram behavior out of `apps/remote-mcp/src/index.ts` as part of this refactor.

## Scope

In scope:

- Add `hono` to `apps/remote-mcp` dependencies.
- Replace manual pathname checking with Hono routes.
- Expose `POST /mcp` through `app.post("/mcp", ...)`.
- Preserve the per-request `Authorization: Bearer <telegram-bot-token>` behavior.
- Preserve use of `WebStandardStreamableHTTPServerTransport`.
- Preserve the `telegram` MCP tool behavior and output shape.
- Update README wording so `apps/remote-mcp` is described as a Hono HTTP app run by Bun.

Out of scope:

- Adding OAuth, user accounts, or credential persistence.
- Adding automated tests.
- Adding a shared operation registry.
- Changing the local stdio MCP package.
- Changing the public MCP tool schema.
- Changing the remote auth model.
- Switching to a Node runtime or `@hono/node-server`.

## Current Behavior To Preserve

`apps/remote-mcp` must continue to:

- Listen on `process.env.PORT` or `3000` by default.
- Expose the remote MCP endpoint at `/mcp`.
- Require `Authorization: Bearer <telegram-bot-token>` per request.
- Keep `botToken` out of the MCP tool input schema.
- Register the `telegram` tool using `telegramMessageInputSchema.shape`.
- Call `sendTelegramMessage({ ...input, botToken })` from `@messagekit/core`.
- Return both `content` and `structuredContent` from the MCP tool.
- Close the per-request MCP server after handling the request.

## Proposed Implementation

Update `apps/remote-mcp/package.json`:

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.21.0",
    "@messagekit/core": "workspace:*",
    "hono": "^4.0.0"
  }
}
```

Update `apps/remote-mcp/src/index.ts` to import Hono:

```ts
import { Hono } from "hono";
```

Keep `getBearerToken` and `createServer` mostly unchanged.

Change `handleMcpRequest` so it only handles auth and MCP transport work. It should not inspect `request.url` for routing.

```ts
async function handleMcpRequest(request: Request) {
  const botToken = getBearerToken(request);

  if (!botToken) {
    return Response.json(
      { error: "Authorization: Bearer <telegram-bot-token> is required" },
      { status: 401 },
    );
  }

  const server = createServer(botToken);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    return await transport.handleRequest(request);
  } finally {
    await server.close();
  }
}
```

Create a Hono app for routing:

```ts
const app = new Hono();

app.post("/mcp", async (c) => {
  return handleMcpRequest(c.req.raw);
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});
```

Replace direct `Bun.serve` usage with Bun's default export server shape:

```ts
const port = Number(process.env.PORT ?? 3000);

console.log(`Remote MCP server listening on http://localhost:${port}/mcp`);

export default {
  port,
  fetch: app.fetch,
};
```

## README Updates

Change the `apps/remote-mcp` package detail from:

```md
Creates a Bun HTTP server exposing `/mcp`.
```

to:

```md
Creates a Hono HTTP app exposing `/mcp`, run by Bun in development.
```

The rest of the remote MCP usage docs should remain unchanged unless implementation details change.

## Verification

Run:

```bash
bun install
bun run --filter @messagekit/remote-mcp typecheck
bun run dev:remote-mcp
```

Manual verification should cover:

- Server starts on `PORT` or `3000`.
- `POST /mcp` without `Authorization` returns `401`.
- Unknown routes return `404` JSON.
- `POST /mcp` with `Authorization: Bearer <telegram-bot-token>` still reaches the MCP transport.
- Existing OpenCode remote MCP config continues to point at `/mcp` without changes.

## Expected Outcome

This refactor may not reduce LOC. A Hono version will likely be similar in size to the current `Bun.serve` version.

The expected improvement is readability:

- Route declarations become explicit.
- Future endpoints like `/health` have an obvious home.
- The HTTP layer feels less bespoke.
- The tutorial can focus on MCP architecture instead of manual Bun routing.

## Success Criteria

The refactor is successful when:

- `apps/remote-mcp` no longer calls `Bun.serve` directly.
- `POST /mcp` is declared through Hono.
- Remote MCP behavior is unchanged from the client perspective.
- Typechecking passes.
- README accurately describes the remote MCP package as Hono-backed.
