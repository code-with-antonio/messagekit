# MessageKit Rename Plan

## Goal

Rename the project from the generic `starter` identity to `messagekit` so the tutorial is immediately understandable.

MessageKit should communicate the product idea clearly:

```text
One messaging capability exposed through CLI, MCP, and Skill interfaces.
```

The first provider remains Telegram, but the project name should leave room for future providers such as Discord, Slack, email, SMS, or other messaging platforms.

## Naming Decision

Use `MessageKit` as the human-facing product name and `messagekit` as the command/package name.

Recommended positioning:

```text
MessageKit lets agents and developers send messages through CLI, MCP, and Skill interfaces.
```

Avoid continuing to describe the repository as only a starter. It can still be tutorial-friendly, but the name should describe the tool being built.

## Public Name Map

Rename these public identifiers:

```text
Starter                    -> MessageKit
starter                    -> messagekit
starter-workspace          -> messagekit-workspace
@starter/core              -> @messagekit/core
@starter/cli               -> @messagekit/cli
@starter/local-mcp         -> @messagekit/local-mcp
@starter/remote-mcp        -> @messagekit/remote-mcp
@starter/skill             -> @messagekit/skill
starter telegram ...       -> messagekit telegram ...
starter init ...           -> messagekit init ...
starter-mcp                -> messagekit-mcp
starter-local              -> messagekit-local
starter-remote             -> messagekit-remote
~/.config/starter          -> ~/.config/messagekit
```

Keep these names unchanged:

```text
packages/core
packages/cli
packages/local-mcp
apps/remote-mcp
packages/skill
sendTelegramMessage
telegram MCP tool
telegram CLI command
TELEGRAM_BOT_TOKEN
```

## Package Changes

Update root `package.json`:

```json
{
  "name": "messagekit-workspace"
}
```

Update package names:

```json
// packages/core/package.json
{
  "name": "@messagekit/core"
}

// packages/cli/package.json
{
  "name": "@messagekit/cli",
  "bin": {
    "messagekit": "./src/index.ts"
  }
}

// packages/local-mcp/package.json
{
  "name": "@messagekit/local-mcp",
  "bin": {
    "messagekit-mcp": "./src/index.ts"
  }
}

// apps/remote-mcp/package.json
{
  "name": "@messagekit/remote-mcp"
}

// packages/skill/package.json
{
  "name": "@messagekit/skill"
}
```

Update all workspace dependencies from `@starter/core` to `@messagekit/core`.

After package changes, run:

```bash
bun install
```

This should regenerate `bun.lock` with the new package scope.

## Source Code Changes

Update imports:

```ts
import { sendTelegramMessage, telegramMessageInputSchema } from "@messagekit/core";
```

Update MCP server names:

```text
starter-local  -> messagekit-local
starter-remote -> messagekit-remote
```

Update CLI program name and config paths in `packages/cli`:

```text
program name: messagekit
config dir:   ~/.config/messagekit
config file:  ~/.config/messagekit/config.json
```

Do not rename the Telegram operation yet. The canonical operation should remain:

```text
core function: sendTelegramMessage
CLI command:   messagekit telegram <chatId> <message>
MCP tool:      telegram
Skill usage:   telegram
```

## Documentation Changes

Update README title to make the project obvious:

```md
# MessageKit: Send Messages Through MCP, CLI, and Skills
```

Replace generic starter language with product-specific language:

```text
MessageKit is a tutorial project for building one messaging capability and exposing it through three interfaces: a CLI, a local MCP server, a deployable remote MCP server, and Skill instructions.
```

Update examples:

```bash
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit"
messagekit init --telegram-bot-token "<bot-token>"
messagekit telegram "<chat-id>" "Hello from MessageKit" --json
```

Update MCP client examples:

```json
{
  "mcpServers": {
    "messagekit": {
      "command": "messagekit-mcp",
      "args": [],
      "environment": {
        "TELEGRAM_BOT_TOKEN": "<bot-token>"
      }
    }
  }
}
```

Update remote MCP examples:

```json
{
  "mcp": {
    "messagekit": {
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

Update Skill documentation:

```text
Starter Skill -> MessageKit Skill
Starter toolset -> MessageKit toolset
@starter/core -> @messagekit/core
starter CLI -> messagekit CLI
```

Update `AGENTS.md` so future agents preserve the new project identity and do not reintroduce `starter` naming.

## Repository Directory

The current local folder is:

```text
/Users/antonioerdeljac/Work/mcp-starter
```

Renaming the local repository directory is optional and should be handled separately from code changes because it affects local shell paths, editor state, MCP client config, and ignored local config files.

If renamed later, prefer:

```text
/Users/antonioerdeljac/Work/messagekit
```

## Local Config Migration

The CLI config path changes from:

```text
~/.config/starter/config.json
```

to:

```text
~/.config/messagekit/config.json
```

Do not add backward compatibility unless there is a concrete need. This repository is still a tutorial project, so a clean rename is easier to teach.

Update docs to tell users to rerun:

```bash
messagekit init --telegram-bot-token "<bot-token>"
```

## Verification

After implementation, run:

```bash
bun install
bun run typecheck
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit" --json
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:local-mcp
bun run dev:remote-mcp
```

Manual checks:

```text
No @starter imports remain.
No starter CLI examples remain.
No Starter product references remain except historical specs if intentionally preserved.
The telegram operation still works through core, CLI, local MCP, remote MCP, and Skill guidance.
```

Use targeted searches:

```bash
rg "@starter|starter|Starter|mcp-starter|starter-mcp|starter-local|starter-remote"
rg "@messagekit|messagekit|MessageKit"
```

## Commit Strategy

Make the rename as one focused commit:

```text
refactor: rename project to messagekit
```

Do not combine the rename with feature changes, provider additions, or behavior changes.
