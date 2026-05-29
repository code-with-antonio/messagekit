# MessageKit: Send Messages Through MCP, CLI, and Skills

MessageKit is a tutorial project for building one messaging capability and exposing it through CLI, local MCP, remote MCP, and Skill interfaces:

- `packages/core`: Shared schemas and operations.
- `packages/cli`: Human/script CLI adapter.
- `packages/local-mcp`: Local MCP stdio server adapter for AI clients.
- `apps/remote-mcp`: Remote MCP HTTP adapter for deployed clients.
- `packages/skill`: Agent-facing usage instructions.

The central pattern is:

```text
core capability -> CLI command -> MCP tool -> Skill instructions
```

Business logic belongs in `packages/core`. The CLI, MCP server, and Skill should only adapt that shared implementation for their audiences.

## Prerequisites

- Bun installed locally.
- A Telegram bot token.
- A Node-compatible MCP client if you want to connect the MCP server.

## Install

```bash
bun install
```

## Quick Smoke Test

Run the CLI Telegram command:

```bash
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit"
```

Expected readable output:

```text
Sent Telegram message 123 to chat <chat-id>
```

Run Telegram with script-friendly JSON output:

```bash
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit" --json
```

Expected output:

```json
{
  "ok": true,
  "chatId": "<chat-id>",
  "messageId": 123
}
```

Start the local MCP stdio server:

```bash
bun run dev:local-mcp
```

Expected behavior: the process stays running and waits for MCP messages over stdio. Stop it with `Ctrl-C` when testing manually.

Start the remote MCP HTTP server:

```bash
bun run dev:remote-mcp
```

Expected behavior: the server listens on `PORT` or `3000` by default and exposes `POST /mcp`.

## Architecture

```text
packages/core        -> shared schemas and operations
packages/cli         -> command-line adapter backed by core
packages/local-mcp   -> local MCP stdio adapter backed by core
apps/remote-mcp      -> remote MCP HTTP adapter backed by core
packages/skill       -> agent-facing instructions and fallback guidance
```

Dependency direction:

```text
@codewithantonio/messagekit-core
   ▲       ▲       ▲
   │       │       │
@codewithantonio/messagekit
@codewithantonio/messagekit-mcp
messagekit-remote-mcp

messagekit-skill is documentation/instructions only
```

## Package Details

`packages/core` owns reusable logic:

- Zod schemas for shared inputs and outputs.
- Operation functions such as `sendTelegramMessage`.
- Type exports derived from schemas.
- No CLI imports, MCP SDK imports, terminal output, prompts, or `process.exit`.

`packages/cli` owns human and script usage:

- Defines `messagekit telegram <chatId> <message>`.
- Parses command arguments with Commander.
- Calls `@codewithantonio/messagekit-core` functions.
- Prints readable output by default.
- Supports `--json` for scriptable and agent-readable output.

`packages/local-mcp` owns local MCP stdio usage:

- Creates an MCP stdio server.
- Registers a `telegram` tool backed by `@codewithantonio/messagekit-core`.
- Uses the shared Telegram message input schema.
- Returns both `content` and `structuredContent`.

`apps/remote-mcp` owns remote MCP HTTP usage:

- Creates a Hono HTTP app exposing `/mcp`, run by Bun in development.
- Registers a `telegram` tool backed by `@codewithantonio/messagekit-core`.
- Reads the Telegram bot token from `Authorization: Bearer <token>` per request.
- Keeps the token out of the MCP tool input schema.

`packages/skill` owns agent instructions:

- Prefers the MCP `telegram` tool when available.
- Documents CLI fallback usage.
- Explains that `@codewithantonio/messagekit-core` is an implementation detail.
- Avoids duplicating business logic.

## Telegram Operation

MessageKit includes one canonical tutorial operation: `sendTelegramMessage`.

Public interface names:

```text
core function: sendTelegramMessage
CLI command:   messagekit telegram <chatId> <message>
MCP tool:      telegram
Skill usage:   telegram
```

Telegram messages are sent through the Telegram Bot API. The CLI reads the bot token from local user config created by `messagekit init`. The local MCP server reads `TELEGRAM_BOT_TOKEN` from the MCP client-provided server environment. The remote MCP server reads the token from the per-request `Authorization: Bearer <token>` header. All adapters pass the token into `@codewithantonio/messagekit-core`; it is not exposed as an MCP tool argument.

## CLI Usage

Development commands:

```bash
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit" --json
```

Local linked binary commands:

```bash
cd packages/cli
bun link
messagekit --help
```

After linking the binary, these can be run from anywhere on the machine:

```bash
messagekit init --telegram-bot-token "<bot-token>"
messagekit telegram "<chat-id>" "Hello from MessageKit"
messagekit telegram "<chat-id>" "Hello from MessageKit" --json
```

To remove the local linked binary, run this from `packages/cli`:

```bash
bun unlink
```

See `specs/CLI_LOCAL_LINK.md` for the local linking acceptance criteria.

CLI config is stored at `~/.config/messagekit/config.json`. If you used the old tutorial config path, rerun `messagekit init --telegram-bot-token "<bot-token>"`.

## MCP Usage

Run the local MCP server:

```bash
bun run dev:local-mcp
```

Example MCP client config from the repository root:

```json
{
  "mcpServers": {
    "messagekit": {
      "command": "bun",
      "args": ["run", "packages/local-mcp/src/index.ts"],
      "environment": {
        "TELEGRAM_BOT_TOKEN": "<bot-token>"
      }
    }
  }
}
```

For a published package, this can become:

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

Available MCP tools:

- `telegram`: Accepts `{ chatId, message }` and returns `{ ok, chatId, messageId }` output.

## Remote MCP Usage

Run the remote MCP server locally:

```bash
bun run dev:remote-mcp
```

The server exposes `POST /mcp` and requires a per-request bearer token:

```http
Authorization: Bearer <telegram-bot-token>
```

Example OpenCode remote MCP config after deployment:

```json
{
  "$schema": "https://opencode.ai/config.json",
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

This keeps the Telegram bot token user-specific and client-provided without exposing it as a tool argument.

## Skill Usage

The skill lives at `packages/skill/SKILL.md`. Add or copy that file into an agent skill system that supports Markdown skills.

The skill tells agents to:

- Prefer the MCP `telegram` tool when an MCP client is available.
- Use CLI fallback when MCP is unavailable.
- Request JSON output from CLI commands when parsing results.
- Avoid duplicating business logic in the skill.
- Treat `@codewithantonio/messagekit-core` as an implementation detail, not a direct user interface.

CLI fallback example:

```bash
messagekit init --telegram-bot-token "<bot-token>"
messagekit telegram "<chat-id>" "Hello from MessageKit" --json
```

## Add A New Operation

1. Add input and output schemas in `packages/core/src/schemas.ts`.
2. Add the operation function in `packages/core/src/operations.ts`.
3. Export it through `packages/core/src/index.ts` when needed.
4. Add a CLI command in `packages/cli/src/index.ts`.
5. Add a local MCP tool in `packages/local-mcp/src/index.ts`.
6. Add a remote MCP tool in `apps/remote-mcp/src/index.ts` when remote support is part of the tutorial.
7. Add usage notes in `packages/skill/SKILL.md`.
8. Add manual verification commands to the README if the operation is part of the tutorial.

Keep every capability implemented once in `core`:

```text
CLI command = parse input + call core + print output
MCP tool    = validate input + call core + return structured result
Remote MCP  = read request auth + validate input + call core
Skill       = instructions for when/how to use CLI or MCP
```

## Verification Commands

```bash
bun install
bun run typecheck
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit" --json
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:local-mcp
bun run dev:remote-mcp
```

Manual remote verification should confirm the server starts on `PORT` or `3000`, missing `Authorization` is rejected, and a valid bearer token lets the remote `telegram` MCP tool call `@codewithantonio/messagekit-core`.

## Publish Packages To NPM

`@codewithantonio/messagekit-core` is the shared implementation package used by the CLI, MCP servers, and downstream programmatic consumers. Publish it from `packages/core`, not from the repository root.

`@codewithantonio/messagekit` is the published CLI package. It depends on the published core package, so publish core first whenever a release includes core changes.

### Version Bumps

npm versions are immutable. Before publishing, choose versions that have not already been published.

If core changed, bump `packages/core/package.json` first:

```json
{
  "name": "@codewithantonio/messagekit-core",
  "version": "0.1.3"
}
```

Then update the CLI dependency on core to the published semver range:

```json
{
  "dependencies": {
    "@codewithantonio/messagekit-core": "^0.1.3"
  }
}
```

Use actual semver for `@codewithantonio/messagekit-core` in `packages/cli/package.json`, not `workspace:*`. The CLI package is published to npm, and published npm packages cannot rely on workspace-only dependency ranges. Bun can still link the local workspace package during development because the dependency name matches a workspace package.

If the CLI changed, bump `packages/cli/package.json` and keep the CLI's displayed version in `packages/cli/src/index.ts` in sync with it.

After editing versions, refresh the lockfile from the repository root:

```bash
bun install
```

### Pre-Publish Checks

Run the normal workspace checks before publishing either package:

```bash
bun run release:check
```

This script runs formatting checks, linting, typechecking, and both package builds. Use `bun run build:core` or `bun run build:cli` when checking only one package build.

Package builds run through `tsdown`, which produces native Node ESM output in `dist` for publishing while keeping source imports clean. `tsdown` requires Node.js 22.18.0 or newer at build time, but the emitted package output targets the supported Node runtime.

### Git Commit Timing

Commit release preparation changes before running `npm publish`. The commit should include version bumps, dependency range updates, lockfile updates, and documentation changes. Publishing from a committed state makes the npm package traceable to a specific repository revision and avoids publishing local edits that are not recorded in git.

After the publish succeeds, verify npm metadata and consider creating a git tag for the published version. If publishing fails before the package is accepted by npm, fix the issue, rerun the checks, and commit the fix before trying again. If npm accepts the publish but a later verification step fails, do not reuse the same version; bump to a new version for the next publish because npm versions are immutable.

### Publish Core

Run the full publish workflow:

```bash
cd packages/core
bun run pack:dry
npm publish --access public
```

The dry run should include `README.md`, `package.json`, and compiled files under `dist/`, including:

```text
dist/index.js
dist/index.d.ts
dist/index.js.map
```

The dry run should not include `src/`, `node_modules/`, or `tsconfig.build.json`.

If npm asks for a one-time password, rerun only the publish command with the current authenticator code:

```bash
npm publish --access public --otp=<code>
```

If npm says you are not logged in, authenticate first:

```bash
npm adduser
```

After publishing, verify the package metadata:

```bash
npm view @codewithantonio/messagekit-core version
```

### Publish CLI

Publish the CLI only after its `@codewithantonio/messagekit-core` dependency points at a core version that already exists on npm.

Run the CLI publish workflow:

```bash
cd packages/cli
bun run pack:dry
npm publish --access public
```

The dry run should include `README.md`, `package.json`, and compiled files under `dist/`, including:

```text
dist/index.js
dist/index.d.ts
dist/index.js.map
```

The dry run should not include `src/`, `node_modules/`, or `tsconfig.build.json`.

After publishing, verify the package metadata and installed binary:

```bash
npm view @codewithantonio/messagekit version
npm install -g @codewithantonio/messagekit
messagekit --help
messagekit --version
npm uninstall -g @codewithantonio/messagekit
```

## Troubleshooting

If `bun --filter` cannot find a package, run `bun install` from the repository root and confirm the package name matches the workspace package name.

If TypeScript cannot resolve workspace packages, confirm each package has `"type": "module"`, an `exports` entry, and a dependency that can resolve locally. Internal unpublished packages can use `"workspace:*"`; published packages such as `@codewithantonio/messagekit` should use real npm semver ranges for published dependencies.

If the MCP server appears to hang, that is expected for stdio mode. It waits for MCP client messages until the process is stopped.

If an MCP client cannot start the server, confirm its working directory is the repository root or use an absolute path in the config.

If CLI output is difficult to parse in scripts, pass `--json` and parse stdout as JSON.

If Telegram requests fail from the CLI, run `messagekit init` and confirm the bot can send messages to the target chat.

If Telegram requests fail from MCP, confirm the MCP client config provides `TELEGRAM_BOT_TOKEN` in the server `environment`.
