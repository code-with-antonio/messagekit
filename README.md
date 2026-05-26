# Bun Workspaces MCP + CLI + Skill Starter

This repository is a lightweight starter for building one shared TypeScript operation and exposing it through three thin interfaces:

- `packages/core`: Shared schemas and operations.
- `packages/cli`: Human/script CLI adapter.
- `packages/mcp`: MCP stdio server adapter for AI clients.
- `packages/skill`: Agent-facing usage instructions.

The central pattern is:

```text
core capability -> CLI command -> MCP tool -> Skill instructions
```

Business logic belongs in `packages/core`. The CLI, MCP server, and Skill should only adapt that shared implementation for their audiences.

## Prerequisites

- Bun installed locally.
- A Telegram bot token in `TELEGRAM_BOT_TOKEN`.
- A Node-compatible MCP client if you want to connect the MCP server.

## Install

```bash
bun install
```

## Quick Smoke Test

Run the CLI Telegram command:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:cli telegram "<chat-id>" "Hello from Starter"
```

Expected readable output:

```text
Sent Telegram message 123 to chat <chat-id>
```

Run Telegram with script-friendly JSON output:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:cli telegram "<chat-id>" "Hello from Starter" --json
```

Expected output:

```json
{
  "ok": true,
  "chatId": "<chat-id>",
  "messageId": 123
}
```

Start the MCP stdio server:

```bash
bun run dev:mcp
```

Expected behavior: the process stays running and waits for MCP messages over stdio. Stop it with `Ctrl-C` when testing manually.

## Architecture

```text
packages/core  -> shared schemas and operations
packages/cli   -> command-line adapter backed by core
packages/mcp   -> MCP stdio server adapter backed by core
packages/skill -> agent-facing instructions and fallback guidance
```

Dependency direction:

```text
@starter/core
   ▲       ▲
   │       │
@starter/cli
@starter/mcp

@starter/skill is documentation/instructions only
```

## Package Details

`packages/core` owns reusable logic:

- Zod schemas for shared inputs and outputs.
- Operation functions such as `sendTelegramMessage`.
- Type exports derived from schemas.
- No CLI imports, MCP SDK imports, terminal output, prompts, or `process.exit`.

`packages/cli` owns human and script usage:

- Defines `starter telegram <chatId> <message>`.
- Parses command arguments with Commander.
- Calls `@starter/core` functions.
- Prints readable output by default.
- Supports `--json` for scriptable and agent-readable output.

`packages/mcp` owns MCP protocol usage:

- Creates an MCP stdio server.
- Registers a `telegram` tool backed by `@starter/core`.
- Uses the shared Telegram message input schema.
- Returns both `content` and `structuredContent`.

`packages/skill` owns agent instructions:

- Prefers the MCP `telegram` tool when available.
- Documents CLI fallback usage.
- Explains that `@starter/core` is an implementation detail.
- Avoids duplicating business logic.

## Telegram Operation

The starter includes one canonical tutorial operation: `sendTelegramMessage`.

Public interface names:

```text
core function: sendTelegramMessage
CLI command:   starter telegram <chatId> <message>
MCP tool:      telegram
Skill usage:   telegram
```

Telegram messages are sent through the Telegram Bot API. The bot token is read from `TELEGRAM_BOT_TOKEN` by the CLI and MCP adapters, then passed into `@starter/core`; it is not exposed as an MCP tool argument.

## CLI Usage

Development commands:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:cli telegram "<chat-id>" "Hello from Starter"
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:cli telegram "<chat-id>" "Hello from Starter" --json
```

After publishing or linking a binary, these can become:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" starter telegram "<chat-id>" "Hello from Starter"
TELEGRAM_BOT_TOKEN="<bot-token>" starter telegram "<chat-id>" "Hello from Starter" --json
```

## MCP Usage

Run the local MCP server:

```bash
bun run dev:mcp
```

Example MCP client config from the repository root:

```json
{
  "mcpServers": {
    "starter": {
      "command": "bun",
      "args": ["run", "packages/mcp/src/index.ts"]
    }
  }
}
```

For a published package, this can become:

```json
{
  "mcpServers": {
    "starter": {
      "command": "starter-mcp",
      "args": []
    }
  }
}
```

Available MCP tools:

- `telegram`: Accepts `{ chatId, message }` and returns `{ ok, chatId, messageId }` output.

## Skill Usage

The skill lives at `packages/skill/SKILL.md`. Add or copy that file into an agent skill system that supports Markdown skills.

The skill tells agents to:

- Prefer the MCP `telegram` tool when an MCP client is available.
- Use CLI fallback when MCP is unavailable.
- Request JSON output from CLI commands when parsing results.
- Avoid duplicating business logic in the skill.
- Treat `@starter/core` as an implementation detail, not a direct user interface.

CLI fallback example:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" starter telegram "<chat-id>" "Hello from Starter" --json
```

## Add A New Operation

1. Add input and output schemas in `packages/core/src/schemas.ts`.
2. Add the operation function in `packages/core/src/operations.ts`.
3. Export it through `packages/core/src/index.ts` when needed.
4. Add a CLI command in `packages/cli/src/index.ts`.
5. Add an MCP tool in `packages/mcp/src/index.ts`.
6. Add usage notes in `packages/skill/SKILL.md`.
7. Add manual verification commands to the README if the operation is part of the tutorial.

Keep every capability implemented once in `core`:

```text
CLI command = parse input + call core + print output
MCP tool    = validate input + call core + return structured result
Skill       = instructions for when/how to use CLI or MCP
```

## Verification Commands

```bash
bun install
bun run typecheck
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:cli telegram "<chat-id>" "Hello from Starter"
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:cli telegram "<chat-id>" "Hello from Starter" --json
bun run dev:mcp
```

## Troubleshooting

If `bun --filter` cannot find a package, run `bun install` from the repository root and confirm the package name matches the workspace package name.

If TypeScript cannot resolve workspace packages, confirm each package has `"type": "module"`, an `exports` entry, and the dependency uses `"workspace:*"`.

If the MCP server appears to hang, that is expected for stdio mode. It waits for MCP client messages until the process is stopped.

If an MCP client cannot start the server, confirm its working directory is the repository root or use an absolute path in the config.

If CLI output is difficult to parse in scripts, pass `--json` and parse stdout as JSON.

If Telegram requests fail, confirm `TELEGRAM_BOT_TOKEN` is set and the bot can send messages to the target chat.
