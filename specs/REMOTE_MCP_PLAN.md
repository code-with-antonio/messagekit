# Remote MCP Package Plan

## Goal

Add a deployable remote MCP server without replacing the existing local stdio MCP server.

The repository should support both adapters:

```text
packages/mcp         -> local MCP stdio adapter
packages/remote-mcp  -> remote MCP HTTP adapter
```

Both adapters should keep using `@starter/core` for business logic.

## Recommendation

Do not rename `packages/mcp` initially.

Keep the current package as the local stdio MCP server and add a new `packages/remote-mcp` package. This is the smallest change and preserves the existing tutorial flow.

Possible future rename, if the tutorial wants clearer transport naming:

```text
packages/mcp        -> packages/local-mcp
packages/remote-mcp -> packages/remote-mcp
```

That rename should be a separate cleanup step because it requires broader README, package, and command updates.

## Package Layout

Create a new workspace package:

```text
packages/remote-mcp/
  package.json
  src/index.ts
```

Suggested package name:

```json
{
  "name": "@starter/remote-mcp"
}
```

## Transport

Keep `packages/mcp` on stdio:

```ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

Use HTTP transport in `packages/remote-mcp`:

```ts
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
```

Expose an HTTP endpoint, likely:

```text
POST /mcp
```

Use Bun's native `Bun.serve` unless there is a concrete need for a framework.

## Tool Registration

Register the same `telegram` MCP tool in the remote package.

The remote package should still import from core:

```ts
import { sendTelegramMessage, telegramMessageInputSchema } from "@starter/core";
```

The MCP tool input should stay user-facing and minimal:

```json
{
  "chatId": "123456789",
  "message": "Hello from Starter"
}
```

Do not add `botToken` to the MCP tool input schema.

## Remote Credential Handling

The remote MCP server must not use one global `TELEGRAM_BOT_TOKEN` for all users.

For a minimal tutorial implementation, require a per-request authorization header:

```http
Authorization: Bearer <telegram-bot-token>
```

The remote adapter extracts the token from the request and passes it to core:

```ts
await sendTelegramMessage({
  ...input,
  botToken,
});
```

The boundary should remain:

```text
MCP input:              { chatId, message }
per-request auth:       botToken
core operation input:   { chatId, message, botToken }
```

A more product-like version could use the authorization header as an app API key and resolve the Telegram bot token from a user credential store. That is not required for the minimal package.

## Package Scripts

Add scripts to `packages/remote-mcp/package.json`:

```json
{
  "scripts": {
    "dev": "bun run src/index.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

Add dependencies:

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.21.0",
    "@starter/core": "workspace:*"
  },
  "devDependencies": {
    "bun-types": "latest"
  }
}
```

Add a root script:

```json
{
  "scripts": {
    "dev:remote-mcp": "bun run packages/remote-mcp/src/index.ts"
  }
}
```

## OpenCode Remote Config

Once deployed, OpenCode can point to the remote MCP server:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "starter": {
      "type": "remote",
      "url": "https://your-host.example.com/mcp",
      "enabled": true,
      "headers": {
        "Authorization": "Bearer {env:TELEGRAM_BOT_TOKEN}"
      }
    }
  }
}
```

This keeps the Telegram bot token user-specific and client-provided without exposing it as a tool argument.

## Documentation Updates

Update README architecture:

```text
packages/core        -> shared schemas and operations
packages/cli         -> command-line adapter backed by core
packages/mcp         -> local MCP stdio adapter backed by core
packages/remote-mcp  -> remote MCP HTTP adapter backed by core
packages/skill       -> agent-facing instructions and fallback guidance
```

Update the dependency diagram:

```text
@starter/core
   ▲       ▲       ▲
   │       │       │
@starter/cli
@starter/mcp
@starter/remote-mcp

@starter/skill is documentation/instructions only
```

Update the operation registration flow to include remote MCP when relevant:

```text
1. Add schemas in packages/core/src/schemas.ts.
2. Add operation logic in packages/core/src/operations.ts.
3. Export from packages/core/src/index.ts when needed.
4. Add a CLI command in packages/cli/src/index.ts.
5. Add a local MCP tool in packages/mcp/src/index.ts.
6. Add a remote MCP tool in packages/remote-mcp/src/index.ts when remote support is part of the tutorial.
7. Add usage notes in packages/skill/SKILL.md.
8. Add manual verification commands to the README.
```

## Verification

Keep existing verification commands for local MCP.

Add remote package checks:

```bash
bun install
bun run typecheck
bun run dev:remote-mcp
```

Manual remote verification should cover:

```text
1. Server starts on PORT or a default local port.
2. Missing Authorization header is rejected.
3. Valid Authorization header allows the telegram MCP tool to call core.
4. Deployed URL works with OpenCode remote MCP config.
```

## Non-Goals For Minimal Remote Package

Do not add these in the first implementation:

- OAuth.
- Database persistence.
- User accounts.
- Hosted credential storage.
- Dynamic operation registration.
- A shared operation registry.
- Automated tests.
- A production deployment guide.
