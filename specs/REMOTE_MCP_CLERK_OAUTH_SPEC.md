# Remote MCP Clerk OAuth Spec

## Goal

Add an optional tutorial step that protects `apps/remote-mcp` with Clerk OAuth while keeping the existing Hono remote MCP adapter and URL-token Telegram credential model.

The goal is to demonstrate standards-based OAuth for remote MCP servers, not to build production user credential storage or a real multi-user Telegram integration.

## Background

The current remote MCP app exposes a Hono HTTP endpoint that accepts the user's Telegram bot token in the URL:

```text
POST /:botToken/mcp
```

That URL-token model exists so ChatGPT can connect with `Authentication: None` while still letting each user supply their own Telegram bot token. For this optional OAuth tutorial step, the URL-token model remains in place, but access to the MCP endpoint must require a valid Clerk OAuth bearer token.

Clerk's Express guide for MCP protection uses `@clerk/mcp-tools/express` to provide:

- An auth middleware that verifies Clerk-issued OAuth bearer tokens.
- A protected resource metadata endpoint for MCP OAuth discovery.
- A streamable HTTP handler for the MCP server.

MessageKit should keep Hono. `@clerk/mcp-tools` exposes framework-agnostic server helpers, including `generateClerkProtectedResourceMetadata`, but it does not currently expose a Hono-specific MCP auth adapter.

`apps/remote-mcp` owns:

- The remote Hono HTTP MCP adapter.
- Remote request credential extraction.
- OAuth gating for this optional tutorial step.
- Registration of the `telegram` MCP tool backed by `@codewithantonio/messagekit-core`.

`apps/remote-mcp` must not own:

- Telegram Bot API business logic.
- CLI config persistence.
- Server-side user credential storage.
- A database-backed Telegram token model.
- A switch from Hono to Express.

## Current Issue

The remote MCP app is currently available to anyone who knows the URL containing the Telegram bot token:

```ts
app.post("/:botToken/mcp", async (c) => {
  const botToken = c.req.param("botToken");
  const server = createServer(botToken);
  // Existing MCP transport handling.
});
```

This is useful for teaching ChatGPT no-auth connector setup, but it does not demonstrate the MCP OAuth flow where the MCP server is a protected resource and the MCP client sends the user through an authorization server.

## Decision

Keep Hono and protect the existing `POST /:botToken/mcp` route with Clerk OAuth.

Unauthenticated requests must not use a normal browser `302` redirect. The MCP-standard behavior is to return `401 Unauthorized` with a `WWW-Authenticate` header that points clients to the public OAuth protected resource metadata endpoint. MCP clients such as ChatGPT web and Claude web can then discover the Clerk authorization server and initiate their own login UX.

The Telegram bot token remains in the URL. Clerk OAuth only gates access to the MCP endpoint. It does not replace, store, mint, or manage Telegram credentials.

## Scope

In scope:

- Keep `apps/remote-mcp` on Hono.
- Keep the remote MCP endpoint at `POST /:botToken/mcp`.
- Require a Clerk OAuth bearer token before the MCP transport handles the request.
- Return MCP-compatible `401` responses with `WWW-Authenticate` for missing or invalid auth.
- Add a public protected resource metadata route for the URL-token MCP endpoint.
- Use `@clerk/mcp-tools/server` for Clerk protected resource metadata generation.
- Use a small Hono middleware or inline route gate for Clerk token verification.
- Keep the `telegram` MCP tool input limited to `chatId` and `message`.
- Update README guidance for the optional Clerk OAuth remote MCP step.

Out of scope:

- Switching `apps/remote-mcp` to Express.
- Removing the URL-token Telegram model.
- Moving the Telegram bot token into Clerk user metadata.
- Adding database persistence.
- Adding user account management flows inside MessageKit.
- Adding OAuth client code to MessageKit.
- Adding automated tests.
- Changing local MCP, CLI, or core package behavior.

## Target Shape

Required environment variables:

```text
CLERK_PUBLISHABLE_KEY=<clerk-publishable-key>
CLERK_SECRET_KEY=<clerk-secret-key>
```

Remote MCP route remains:

```text
POST /:botToken/mcp
```

Public OAuth protected resource metadata route:

```text
GET /.well-known/oauth-protected-resource/:botToken/mcp
```

Unauthenticated MCP requests return a response shaped like:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://your-messagekit-host.example.com/.well-known/oauth-protected-resource/<telegram-bot-token>/mcp"
```

The exact header value should follow the MCP authorization specification and Clerk helper behavior. Do not replace this with a browser redirect.

Metadata route shape:

```ts
app.get("/.well-known/oauth-protected-resource/:botToken/mcp", (c) => {
  return c.json(
    generateClerkProtectedResourceMetadata({
      publishableKey: clerkPublishableKey,
      resourceUrl: new URL(`/${c.req.param("botToken")}/mcp`, c.req.url).toString(),
    }),
  );
});
```

Protected route shape:

```ts
app.post("/:botToken/mcp", async (c) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorizedMcpResponse(c);
  }

  // Verify the Clerk-issued OAuth token before handling MCP.

  const botToken = c.req.param("botToken");
  const server = createServer(botToken);
  // Existing MCP transport handling.
});
```

Tool input remains unchanged:

```json
{
  "chatId": "123456789",
  "message": "Hello from MessageKit"
}
```

## Implementation Notes

- Prefer the smallest Hono-native implementation that satisfies MCP OAuth discovery.
- Do not use `@clerk/mcp-tools/express`; this app must remain Hono.
- Use `@clerk/mcp-tools/server` for protected resource metadata.
- Prefer `@hono/clerk-auth` if it verifies the exact Clerk OAuth bearer token shape needed by MCP clients.
- If `@hono/clerk-auth` does not fit MCP OAuth bearer verification, use `@clerk/backend` directly in a small Hono middleware.
- Require Clerk environment variables at startup. Do not silently disable OAuth when env vars are missing.
- The `.well-known` metadata route must remain publicly accessible.
- The `POST /:botToken/mcp` route must be inaccessible without valid Clerk OAuth.
- Preserve `WebStandardStreamableHTTPServerTransport` with `sessionIdGenerator: undefined` and `enableJsonResponse: true` unless the MCP SDK requires a change for OAuth compatibility.
- Preserve per-request MCP server creation and `server.close()` in `finally`.
- Keep business logic in `packages/core`; this change only gates access to the remote adapter.
- Do not introduce a shared operation registry.

## File Changes

```text
apps/remote-mcp/src/index.ts        -> Add Clerk OAuth metadata route and Hono auth gate.
apps/remote-mcp/package.json        -> Add Clerk MCP/auth dependencies.
README.md                           -> Document optional Clerk OAuth remote MCP setup.
packages/skills/messagekit/SKILL.md -> Update only if remote MCP OAuth usage guidance is included in the Skill.
```

## Documentation Updates

README should include wording equivalent to:

````md
### Optional: Protect Remote MCP With Clerk OAuth

The remote MCP app can be protected with Clerk OAuth while keeping the Telegram bot token in the MCP URL:

```text
https://your-messagekit-host.example.com/<telegram-bot-token>/mcp
```

Set Clerk environment variables before starting the remote MCP app:

```bash
CLERK_PUBLISHABLE_KEY="<publishable-key>" \
CLERK_SECRET_KEY="<secret-key>" \
bun run dev:remote-mcp
```

For MCP OAuth clients, unauthenticated requests receive `401 Unauthorized` with `WWW-Authenticate` metadata. The MCP client is responsible for opening the Clerk login flow.

In the Clerk Dashboard, enable **Dynamic client registration** for OAuth applications before testing with MCP clients that require automatic OAuth client registration.

This tutorial step demonstrates OAuth-protected MCP access. Clerk does not manage the Telegram bot token in this example; the token still comes from the URL.
````

Docs should also mention that ChatGPT web and Claude web support can vary by current MCP OAuth client behavior.

## Implementation Steps

1. Add Clerk dependencies to `apps/remote-mcp/package.json`.
2. Add startup validation for `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `apps/remote-mcp/src/index.ts`.
3. Add `GET /.well-known/oauth-protected-resource/:botToken/mcp` using `generateClerkProtectedResourceMetadata`.
4. Add a Hono auth gate for `POST /:botToken/mcp` that verifies `Authorization: Bearer <clerk-oauth-token>`.
5. Return `401` plus `WWW-Authenticate` for missing or invalid OAuth tokens.
6. Preserve the existing MCP transport handling after auth succeeds.
7. Preserve the existing `telegram` tool schema and `sendTelegramMessage({ ...input, botToken })` call.
8. Update README with optional Clerk OAuth setup and Clerk Dashboard requirements.
9. Run formatting, linting, and typechecking.

## Verification

Run from the workspace root:

```bash
bun install
bun run format
bun run lint
bun run typecheck
```

Manual verification should cover:

- Starting `bun run dev:remote-mcp` without Clerk env vars fails clearly.
- `GET /.well-known/oauth-protected-resource/<telegram-bot-token>/mcp` returns public Clerk protected resource metadata.
- `POST /<telegram-bot-token>/mcp` without `Authorization` returns `401` with `WWW-Authenticate`.
- `POST /<telegram-bot-token>/mcp` with an invalid bearer token returns `401` with `WWW-Authenticate`.
- `POST /<telegram-bot-token>/mcp` with a valid Clerk OAuth bearer token reaches MCP initialization.
- The `telegram` MCP tool schema does not include `botToken`.
- The remote adapter still passes the URL token to core as `sendTelegramMessage({ ...input, botToken })`.

Optional client verification:

```text
Connect ChatGPT web or Claude web to:
https://your-messagekit-host.example.com/<telegram-bot-token>/mcp
```

The MCP client should discover OAuth metadata, send the user through Clerk login, and retry with a Clerk bearer token if the client supports the current MCP OAuth flow.

## Acceptance Criteria

- `apps/remote-mcp` remains a Hono app.
- `POST /:botToken/mcp` is protected by Clerk OAuth.
- The `.well-known` protected resource metadata route is public.
- Missing or invalid OAuth returns MCP-compatible `401` with `WWW-Authenticate`.
- Valid Clerk OAuth allows the existing MCP transport flow to run.
- The Telegram bot token remains in the URL path.
- The MCP tool input remains `{ chatId, message }`.
- README documents the optional Clerk OAuth setup and Dynamic Client Registration requirement.
- `bun run format`, `bun run lint`, and `bun run typecheck` pass.
- No local MCP, CLI, or core behavior changes.

## Non-Goals

- Do not switch to Express.
- Do not implement a browser redirect from the MCP endpoint.
- Do not remove the URL-token Telegram model.
- Do not store Telegram bot tokens in Clerk, a database, or server-side sessions.
- Do not build a production authorization model.
- Do not add automated tests.
- Do not introduce a shared operation registry.
