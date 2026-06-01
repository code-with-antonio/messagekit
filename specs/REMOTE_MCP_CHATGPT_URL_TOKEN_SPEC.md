# Remote MCP ChatGPT URL Token Spec

## Goal

Adapt `apps/remote-mcp` so it can be connected to ChatGPT with `Authentication: None`, following the same setup pattern documented by Firecrawl.

Each user should provide their own Telegram bot token by embedding it in the MCP connector URL, while the MCP tool input remains limited to `chatId` and `message`.

## Background

ChatGPT's no-auth connector flow does not provide a custom header field for per-user API keys. Firecrawl works around this by putting the user's API key directly in the MCP server URL:

```text
https://mcp.firecrawl.dev/YOUR_API_KEY_HERE/v2/mcp
Authentication: None
```

MessageKit's remote MCP app currently expects the token in an HTTP authorization header:

```http
Authorization: Bearer <telegram-bot-token>
```

That works for MCP clients that support custom headers, but it does not work with ChatGPT's `Authentication: None` connector setup.

`apps/remote-mcp` owns:

- The remote HTTP MCP adapter.
- Remote request credential extraction.
- Registration of the `telegram` MCP tool backed by `@codewithantonio/messagekit-core`.

`apps/remote-mcp` must not own:

- Telegram Bot API business logic.
- CLI config persistence.
- OAuth, user accounts, or credential storage for this change.

## Current Issue

The deployed server exposes only `POST /mcp` and requires an authorization header:

```ts
app.post(
  "/mcp",
  zValidator("header", bearerTokenHeaderSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Authorization: Bearer <telegram-bot-token> is required" }, 401);
    }
  }),
  async (c) => {
    const { botToken } = c.req.valid("header");
    // ...
  },
);
```

ChatGPT's no-auth connector will call the configured MCP URL without that header, so connector creation fails before the tool list can be discovered.

## Decision

Use a Firecrawl-style URL token route for ChatGPT compatibility:

```text
POST /:botToken/mcp
```

Users will configure ChatGPT with:

```text
MCP Server URL: https://your-messagekit-host.example.com/<telegram-bot-token>/mcp
Authentication: None
```

The existing header-based `POST /mcp` route should be removed unless a concrete need exists to keep it. This keeps the tutorial focused on the ChatGPT connector behavior and avoids teaching two remote auth paths at once.

## Scope

In scope:

- Replace the remote MCP auth model from `Authorization: Bearer <telegram-bot-token>` to a URL path token.
- Expose the remote MCP endpoint at `POST /:botToken/mcp`.
- Keep `botToken` out of the MCP tool input schema.
- Keep the `telegram` tool backed by `sendTelegramMessage` from `@codewithantonio/messagekit-core`.
- Update README and Skill guidance for ChatGPT connector setup.
- Document that the connector URL contains a secret and must be treated like one.

Out of scope:

- OAuth.
- User accounts.
- Server-side credential persistence.
- A database-backed token exchange.
- Adding `botToken` to the MCP tool input schema.
- Changing local MCP or CLI token behavior.
- Adding automated tests.

## Target Shape

Remote MCP route:

```ts
app.post("/:botToken/mcp", async (c) => {
  const botToken = c.req.param("botToken");
  const server = createServer(botToken);
  // Existing MCP transport handling.
});
```

ChatGPT connector configuration:

```text
Name: MessageKit
Description: Send Telegram messages through MessageKit MCP.
MCP Server URL: https://your-messagekit-host.example.com/<telegram-bot-token>/mcp
Authentication: None
```

Tool input remains unchanged:

```json
{
  "chatId": "123456789",
  "message": "Hello from MessageKit"
}
```

Core operation input remains internal to the adapter:

```json
{
  "chatId": "123456789",
  "message": "Hello from MessageKit",
  "botToken": "<telegram-bot-token>"
}
```

## Implementation Notes

- Prefer the smallest code change in `apps/remote-mcp/src/index.ts`.
- Remove `zValidator` and the header schema if they are no longer used.
- Use Hono route params to read the token from the URL path.
- Use `c.req.param("botToken")`; Hono decodes route params internally, so an extra `decodeURIComponent` call is unnecessary.
- Preserve `WebStandardStreamableHTTPServerTransport` with `sessionIdGenerator: undefined` and `enableJsonResponse: true`.
- Preserve per-request MCP server creation and `server.close()` in `finally`.
- Keep business logic in `packages/core`; the remote app should only extract the token and pass it to `sendTelegramMessage`.
- Do not add a shared operation registry.

## File Changes

```text
apps/remote-mcp/src/index.ts              -> Replace header auth with /:botToken/mcp path auth.
apps/remote-mcp/package.json              -> Remove @hono/zod-validator and zod if unused by this app.
README.md                                 -> Update remote MCP and ChatGPT connector instructions.
packages/skills/messagekit/SKILL.md       -> Update remote MCP usage guidance if it mentions /mcp header auth.
specs/REMOTE_MCP_PLAN.md                  -> Update or supersede header-auth wording if needed.
specs/REMOTE_MCP_HONO_REFACTOR.md         -> Leave historical refactor spec unchanged unless implementation docs are being consolidated.
```

## Documentation Updates

README should include wording equivalent to:

````md
For ChatGPT connectors using `Authentication: None`, include your Telegram bot token in the MCP server URL:

```text
https://your-messagekit-host.example.com/<telegram-bot-token>/mcp
```

Treat this URL like a secret. Anyone with the URL can use the Telegram bot token. If it is exposed, revoke and rotate the token with BotFather.
````

The docs should explain that this follows the Firecrawl-style no-auth connector pattern and is intended for tutorial/developer-mode setup.

## Implementation Steps

1. Update `apps/remote-mcp/src/index.ts` to remove header validation and register `POST /:botToken/mcp`.
2. Extract `botToken` from `c.req.param("botToken")` and pass it to `createServer(botToken)`.
3. Remove unused imports and unused dependencies from `apps/remote-mcp/package.json`.
4. Update README remote MCP setup examples from header auth to URL-token auth.
5. Update Skill guidance if it references remote MCP header auth.
6. Update older remote MCP specs only if they are meant to describe current behavior rather than historical decisions.
7. Run formatting, linting, and typechecking.

## Verification

Run from the workspace root:

```bash
bun install
bun run format
bun run lint
bun run typecheck
```

Manual verification should cover:

- `POST /mcp` no longer succeeds as the ChatGPT route.
- `POST /<telegram-bot-token>/mcp` reaches MCP initialization.
- Unknown routes still return `404` JSON.
- The `telegram` MCP tool schema does not include `botToken`.
- ChatGPT connector creation uses `Authentication: None` and the URL-token endpoint.

Optional local check with MCP Inspector or another HTTP MCP client:

```bash
bun run dev:remote-mcp
```

Then connect to:

```text
http://localhost:3000/<telegram-bot-token>/mcp
```

## Acceptance Criteria

- `apps/remote-mcp` supports Firecrawl-style ChatGPT setup with `Authentication: None`.
- The per-user Telegram bot token is read from the MCP URL path.
- The MCP `telegram` tool input remains `{ chatId, message }`.
- The remote adapter still calls `sendTelegramMessage({ ...input, botToken })` from core.
- README documents the URL-token connector setup and the secret-handling caveat.
- `bun run format`, `bun run lint`, and `bun run typecheck` pass.
- No local MCP, CLI, or core behavior changes.

## Non-Goals

- Do not implement OAuth.
- Do not store user credentials server-side.
- Do not add `botToken` to the MCP tool input.
- Do not add automated tests.
- Do not introduce a shared operation registry.
