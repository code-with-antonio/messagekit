# Local MCP Adapter Spec

## Goal

Expose the shared Telegram operation as a local MCP stdio tool.

This step introduces MCP only after the repository has a working CLI and extracted core operation.

## Background

MCP is the main agent-facing interface taught by SendKit. The local MCP adapter should be a thin protocol adapter over core, not a second implementation of Telegram behavior.

```text
packages/local-mcp owns:
- local MCP stdio server setup
- telegram tool registration
- MCP client environment credential reads
- MCP content and structuredContent responses

packages/local-mcp must not own:
- Telegram API request implementation
- CLI config reads
- remote HTTP auth behavior
- Skill instructions
```

## Decision

Create `packages/local-mcp` in its final location and register the final MCP tool name:

```text
telegram
```

Run the server with the final development command:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:local-mcp
```

## Reconstruction Workspace

Build this step in its own git workspace, such as branch `reconstruction/04-local-mcp-adapter` checked out at `../reconstruction/04-local-mcp-adapter`.

Start from the completed `../reconstruction/03-extract-shared-core` workspace. This step should add the local MCP adapter on top of the working CLI and core package.

Do not reconstruct:

- `specs/`
- `AGENTS.md`
- `CLAUDE.md`

## Scope

In scope:

- Create `packages/local-mcp`.
- Add root `dev:local-mcp` script.
- Update root workspace and TypeScript configuration as needed for the new package.
- Create an MCP stdio server.
- Register a `telegram` tool.
- Use the shared core input schema without exposing `botToken` as MCP tool input.
- Read `TELEGRAM_BOT_TOKEN` from the process environment.
- Return both `content` and `structuredContent`.

Out of scope:

- Remote MCP server.
- Hono.
- Skill package.
- Publishing setup.
- `specs/`.
- `AGENTS.md` and `CLAUDE.md`.
- Operation registry abstraction.

## Target Shape

Tool input:

```json
{
  "chatId": "123456789",
  "message": "Hello from SendKit"
}
```

Tool output structured content:

```json
{
  "ok": true,
  "chatId": "123456789",
  "messageId": 42
}
```

Run command:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:local-mcp
```

Dependency direction:

```text
packages/local-mcp -> packages/core
```

## Implementation Notes

- Use the MCP TypeScript SDK stdio transport.
- The MCP tool input must not include `botToken`.
- Compose the core input inside the tool handler by combining MCP input with the environment token.
- Keep credential failure messages clear but do not print secrets.
- Keep tool registration explicit.

## File Changes

```text
package.json                         -> dev:local-mcp script
packages/local-mcp/package.json      -> local MCP package metadata and dependencies
packages/local-mcp/src/index.ts      -> stdio MCP server and telegram tool
tsconfig.json                        -> workspace TypeScript updates if needed for local MCP
bun.lock                             -> dependency lockfile updates
TEACHER.md                           -> update teacher-facing manual verification guide for this chapter
```

## Documentation Updates

Document the local MCP command and the client environment variable requirement:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:local-mcp
```

Explain that MCP tool callers provide only `chatId` and `message`.

`TEACHER.md` must document only this step's new teaching and verification needs. Include:

- Why local MCP reads `TELEGRAM_BOT_TOKEN` from the MCP client-provided environment instead of the CLI config file.
- How to start the stdio server from the workspace root with `TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:local-mcp`.
- How to explain stdio behavior: the command may appear to hang because it is waiting for MCP client messages on standard input.
- How to verify the `telegram` tool is discoverable in an MCP client.
- How to verify the tool input contains only `chatId` and `message`, not `botToken`.
- How to verify `content` and `structuredContent` both come back from a successful tool call.
- Explain that stdout belongs to the MCP protocol in stdio mode. Normal debug logs on stdout can break the client/server conversation, so temporary debugging should use stderr.
- Explain why the MCP adapter is thin: it translates protocol input/output and delegates message sending to core.

## Implementation Steps

1. Create `packages/local-mcp` and add MCP SDK dependency.
2. Add the root `dev:local-mcp` script.
3. Create the stdio MCP server.
4. Register the `telegram` tool using the shared core schema.
5. Read `TELEGRAM_BOT_TOKEN` inside the adapter and call `sendTelegramMessage`.
6. Return readable `content` and machine-readable `structuredContent`.
7. Manually verify the server starts and can be configured in an MCP client.

## Verification

Run from the workspace root:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:local-mcp
```

Manual verification should cover:

- The MCP server starts on stdio.
- The `telegram` tool is discoverable by an MCP client.
- Calling `telegram` sends a Telegram message.
- Tool input does not ask for `botToken`.
- Missing `TELEGRAM_BOT_TOKEN` fails clearly.

## Acceptance Criteria

- `packages/local-mcp` exists in its final location.
- MCP tool name is `telegram`.
- Local MCP calls `sendTelegramMessage` from core.
- Local MCP returns both `content` and `structuredContent`.
- No remote MCP behavior is introduced.

## Non-Goals

- Do not copy files from the finished `main` branch that are not required for this step.
- Do not add HTTP transport.
- Do not use one shared operation registry.
- Do not read the CLI config file from local MCP.
