# CodeWithAntonio Package Scope Plan

## Goal

Move MessageKit away from the assumed `@messagekit/*` npm scope and into a package model that reflects the real distribution plan.

The npm organization is `@codewithantonio`, but not every workspace package should use that scope. Use the scope only for packages intended to be installable from npm.

## Final Naming Decision

Published npm packages:

```text
packages/cli       -> @codewithantonio/messagekit
packages/core      -> @codewithantonio/messagekit-core
packages/local-mcp -> @codewithantonio/messagekit-mcp
```

Private workspace-only packages/apps:

```text
apps/remote-mcp    -> messagekit-remote-mcp
packages/skill     -> messagekit-skill
```

This gives the workspace a clear convention:

```text
@codewithantonio/* = installable npm package
messagekit-*       = private workspace-only package or app
```

Do not use generic package names such as `@codewithantonio/core` or `@codewithantonio/cli`. The package basename should keep the MessageKit product identity.

## Package Roles

`@codewithantonio/messagekit` is the primary user-facing CLI package.

Users install it from npm and run the `messagekit` binary:

```bash
npm install -g @codewithantonio/messagekit
messagekit --help
```

`@codewithantonio/messagekit-core` is the shared implementation package.

It is required by the CLI and MCP packages, and it can also be used directly as an SDK for programmatic usage:

```bash
npm install @codewithantonio/messagekit-core
```

```ts
import { sendTelegramMessage } from "@codewithantonio/messagekit-core";
```

`@codewithantonio/messagekit-mcp` is the local MCP stdio server package.

Users install it when they want an MCP client to launch MessageKit locally:

```bash
npm install -g @codewithantonio/messagekit-mcp
```

MCP clients still run the `messagekit-mcp` binary:

```json
{
  "mcpServers": {
    "messagekit": {
      "command": "messagekit-mcp"
    }
  }
}
```

`messagekit-remote-mcp` is a private Hono server app for remote MCP deployment.

It is deployed as a service, not installed from npm.

`messagekit-skill` is a private workspace package for Skill documentation/instructions.

It is not currently published. The Skill may later be bundled into `@codewithantonio/messagekit`, but leave it as a separate private workspace package for now.

## Keep Unchanged

These product, runtime, and tutorial-facing names should not change:

```text
Product name:       MessageKit
CLI binary:         messagekit
MCP binary:         messagekit-mcp
Config path:        ~/.config/messagekit/config.json
CLI command:        messagekit telegram <chatId> <message>
MCP tool name:      telegram
Core operation:     sendTelegramMessage
Repository folder:  messagekit
Root package name:  messagekit-workspace
Package folders:    packages/core, packages/cli, packages/local-mcp, packages/skill
Remote app folder:  apps/remote-mcp
```

The rename should affect package identities, dependency specifiers, imports, and documentation package references. It should not change the MessageKit brand or command names.

## Package Manifest Changes

Update `packages/cli/package.json`:

```json
{
  "name": "@codewithantonio/messagekit",
  "bin": {
    "messagekit": "./src/index.ts"
  },
  "dependencies": {
    "@codewithantonio/messagekit-core": "workspace:*"
  }
}
```

Update `packages/core/package.json`:

```json
{
  "name": "@codewithantonio/messagekit-core"
}
```

Update `packages/local-mcp/package.json`:

```json
{
  "name": "@codewithantonio/messagekit-mcp",
  "bin": {
    "messagekit-mcp": "./src/index.ts"
  },
  "dependencies": {
    "@codewithantonio/messagekit-core": "workspace:*"
  }
}
```

Update `apps/remote-mcp/package.json`:

```json
{
  "name": "messagekit-remote-mcp",
  "private": true,
  "dependencies": {
    "@codewithantonio/messagekit-core": "workspace:*"
  }
}
```

Update `packages/skill/package.json`:

```json
{
  "name": "messagekit-skill",
  "private": true
}
```

## Source Code Changes

Update all imports from the old core package name:

```ts
import { sendTelegramMessage, telegramMessageInputSchema } from "@messagekit/core";
```

to the new package name:

```ts
import { sendTelegramMessage, telegramMessageInputSchema } from "@codewithantonio/messagekit-core";
```

Expected source files:

```text
packages/cli/src/index.ts
packages/local-mcp/src/index.ts
apps/remote-mcp/src/index.ts
```

Update source-facing descriptions that reference the core package name, such as the CLI description in `packages/cli/src/index.ts`.

Do not rename the CLI program from `messagekit`.

## Lockfile Changes

After manifest changes, run:

```bash
bun install
```

This should update `bun.lock` so workspace package entries use:

```text
@codewithantonio/messagekit
@codewithantonio/messagekit-core
@codewithantonio/messagekit-mcp
messagekit-remote-mcp
messagekit-skill
```

Do not edit the lockfile by hand unless `bun install` cannot regenerate it correctly.

## Documentation Changes

Update package identity references in:

```text
README.md
AGENTS.md
packages/skill/SKILL.md
specs/CLI_LOCAL_LINK.md
specs/REMOTE_MCP_PLAN.md
specs/REMOTE_MCP_HONO_REFACTOR.md
specs/MESSAGEKIT_RENAME_PLAN.md
```

Replace package references:

```text
@messagekit/cli
@messagekit/core
@messagekit/local-mcp
@messagekit/remote-mcp
@messagekit/skill
```

with:

```text
@codewithantonio/messagekit
@codewithantonio/messagekit-core
@codewithantonio/messagekit-mcp
messagekit-remote-mcp
messagekit-skill
```

Keep product and runtime examples unchanged when they refer to the CLI, MCP server name, config path, or MessageKit brand.

Examples that should stay unchanged:

```bash
messagekit --help
messagekit init --telegram-bot-token "<bot-token>"
messagekit telegram "<chat-id>" "Hello from MessageKit"
messagekit telegram "<chat-id>" "Hello from MessageKit" --json
```

```json
{
  "mcpServers": {
    "messagekit": {
      "command": "messagekit-mcp"
    }
  }
}
```

## Verification Command Updates

Update package filter examples from:

```bash
bun --filter @messagekit/cli dev init --telegram-bot-token "<bot-token>"
bun --filter @messagekit/cli dev telegram "<chat-id>" "Hello from MessageKit"
bun --filter @messagekit/cli dev telegram "<chat-id>" "Hello from MessageKit" --json
TELEGRAM_BOT_TOKEN="<bot-token>" bun --filter @messagekit/local-mcp dev
bun --filter @messagekit/remote-mcp dev
```

to:

```bash
bun --filter @codewithantonio/messagekit dev init --telegram-bot-token "<bot-token>"
bun --filter @codewithantonio/messagekit dev telegram "<chat-id>" "Hello from MessageKit"
bun --filter @codewithantonio/messagekit dev telegram "<chat-id>" "Hello from MessageKit" --json
TELEGRAM_BOT_TOKEN="<bot-token>" bun --filter @codewithantonio/messagekit-mcp dev
bun --filter messagekit-remote-mcp dev
```

## Implementation Order

1. Update package names and workspace dependency specifiers in package manifests.
2. Run `bun install` to regenerate `bun.lock`.
3. Update TypeScript import specifiers and package-name descriptions.
4. Update README, Skill instructions, AGENTS.md, and existing specs.
5. Search for remaining `@messagekit/` references and classify each occurrence as either intentional historical context or a missed rename.
6. Run formatting, linting, and typechecking.

## Verification

Run:

```bash
bun install
bun run format
bun run lint
bun run typecheck
```

Then smoke-check package filters:

```bash
bun --filter @codewithantonio/messagekit dev --help
TELEGRAM_BOT_TOKEN="<bot-token>" bun --filter @codewithantonio/messagekit-mcp dev
bun --filter messagekit-remote-mcp dev
```

The Telegram send commands still require a real bot token and chat ID for full manual verification.

## Success Criteria

- Published npm packages use the `@codewithantonio/*` scope.
- Private workspace-only packages use unscoped `messagekit-*` names.
- No package is named under `@messagekit/*`.
- CLI and MCP workspace dependencies use `@codewithantonio/messagekit-core`.
- All TypeScript imports resolve through `@codewithantonio/messagekit-core`.
- The CLI package is named `@codewithantonio/messagekit`.
- The CLI command remains `messagekit`.
- The local MCP package is named `@codewithantonio/messagekit-mcp`.
- The local MCP binary remains `messagekit-mcp`.
- The remote MCP app is named `messagekit-remote-mcp` and remains private.
- The Skill package is named `messagekit-skill` and remains private.
- The human-facing product name remains `MessageKit`.
- `bun run typecheck` succeeds after the rename.
