# Remote MCP Adapter Spec

## Goal

Expose the shared Telegram operation through a remote MCP HTTP server.

This step adds the hosted-style adapter after local MCP is already understood.

## Background

Local MCP uses stdio and receives credentials from the client process environment. Remote MCP uses HTTP and must handle credentials per request.

```text
apps/remote-mcp owns:
- Hono HTTP app
- POST /mcp endpoint
- per-request bearer token extraction
- remote MCP transport handling
- telegram tool registration for remote clients

apps/remote-mcp must not own:
- Telegram API implementation
- CLI config reads
- global TELEGRAM_BOT_TOKEN for all users
- Skill fallback logic
```

## Decision

Create the remote adapter directly in its final app location:

```text
apps/remote-mcp
```

Use Hono and the final auth model from the start:

```http
Authorization: Bearer <telegram-bot-token>
```

## Reconstruction Workspace

Build this step in its own git workspace, such as branch `reconstruction/06-remote-mcp-adapter` checked out at `../reconstruction/06-remote-mcp-adapter`.

Start from the completed `../reconstruction/05-sendkit-skill` workspace. This step should add remote MCP on top of the existing CLI, core, local MCP, and Skill layers.

Do not reconstruct:

- `specs/`
- `AGENTS.md`
- `CLAUDE.md`

## Scope

In scope:

- Create `apps/remote-mcp`.
- Add root `dev:remote-mcp` script.
- Update root workspace and TypeScript configuration as needed for the new app.
- Create a Hono HTTP app.
- Expose `POST /mcp`.
- Register the same `telegram` tool.
- Extract Telegram bot token from `Authorization: Bearer <token>` per request.
- Return both `content` and `structuredContent`.
- Close the per-request MCP server after handling the request.

Out of scope:

- OAuth.
- User accounts.
- Credential persistence.
- Production deployment guidance.
- Global `TELEGRAM_BOT_TOKEN` auth.
- `specs/`.
- `AGENTS.md` and `CLAUDE.md`.

## Target Shape

Run command:

```bash
bun run dev:remote-mcp
```

HTTP endpoint:

```text
POST /mcp
```

Auth header:

```http
Authorization: Bearer <telegram-bot-token>
```

Boundary:

```text
MCP input:              { chatId, message }
per-request auth:       botToken
core operation input:   { chatId, message, botToken }
```

Dependency direction:

```text
apps/remote-mcp -> packages/core
```

## Implementation Notes

- Use Hono from the beginning if it is the final tutorial choice.
- Do not use one global `TELEGRAM_BOT_TOKEN` for remote users.
- Keep the MCP tool input free of secrets.
- Keep registration explicit and parallel to local MCP.
- Return clear unauthorized responses for missing or malformed bearer tokens.

## File Changes

```text
package.json                    -> dev:remote-mcp script and workspace entry if needed
apps/remote-mcp/package.json    -> remote app metadata and dependencies
apps/remote-mcp/src/index.ts    -> Hono app, /mcp endpoint, MCP server setup
tsconfig.json                   -> workspace TypeScript updates if needed for remote MCP
bun.lock                        -> dependency lockfile updates
TEACHER.md                      -> update teacher-facing manual verification guide for this chapter
```

## Documentation Updates

Document remote MCP separately from local MCP:

```bash
bun run dev:remote-mcp
```

Document that remote clients send the Telegram token with:

```http
Authorization: Bearer <telegram-bot-token>
```

`TEACHER.md` must document only this step's new teaching and verification needs. Include:

- Why remote MCP receives the Telegram token per request through `Authorization: Bearer <token>` instead of a global environment variable.
- How to start the remote server from the workspace root with `bun run dev:remote-mcp`.
- How to verify missing `Authorization` fails clearly before any Telegram send attempt.
- How to explain that the bearer token is still the Telegram bot token for this tutorial, not SendKit user auth or OAuth.
- How to verify the MCP tool input still contains only `chatId` and `message`.
- Explain why remote MCP cannot use one global `TELEGRAM_BOT_TOKEN`: each HTTP request may represent a different caller and therefore a different Telegram bot token.
- Explain why the per-request MCP server is closed after handling the request: the server is scoped to that HTTP request instead of being a long-lived stdio process.
- Explain that Hono is only the HTTP adapter here. The chapter is about transport and per-request credentials, not production hosting or user accounts.

## Implementation Steps

1. Create `apps/remote-mcp` and install Hono plus MCP dependencies.
2. Add the root `dev:remote-mcp` script.
3. Create the Hono app with `POST /mcp`.
4. Extract and validate the bearer token per request.
5. Register the `telegram` tool backed by core.
6. Return MCP content and structured content.
7. Ensure the per-request MCP server is closed after the request.
8. Verify the server starts and rejects missing authorization.

## Verification

Run from the workspace root:

```bash
bun run dev:remote-mcp
```

Manual verification should cover:

- Server starts successfully.
- `POST /mcp` exists.
- Missing `Authorization` fails clearly.
- Bearer token is not part of the MCP tool input schema.
- Remote `telegram` calls `sendTelegramMessage` from core.

## Acceptance Criteria

- Remote MCP app exists at `apps/remote-mcp`.
- Remote MCP uses Hono.
- Remote MCP reads bot token from `Authorization: Bearer <token>` per request.
- Remote MCP does not use a global Telegram bot token.
- Remote MCP returns both `content` and `structuredContent`.

## Non-Goals

- Do not copy files from the finished `main` branch that are not required for this step.
- Do not add OAuth or user credential storage.
- Do not add hosted deployment docs.
- Do not add database persistence.
