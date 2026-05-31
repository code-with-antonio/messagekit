<p align="center">
  <img src="./assets/messagekit-logo.svg" width="180" alt="MessageKit logo" />
</p>

<h1 align="center">MessageKit</h1>

<p align="center">
  Build agent-ready messaging tools with one shared TypeScript core for MCP, CLI, and Skills.
</p>

<p align="center">
  by <a href="https://x.com/codewithantonio">@codewithantonio</a>
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT license" /></a>
  <a href="https://www.npmjs.com/package/@codewithantonio/messagekit"><img src="https://img.shields.io/npm/dw/@codewithantonio/messagekit?label=downloads" alt="Weekly downloads" /></a>
  <a href="https://www.youtube.com/@codewithantonio"><img src="https://img.shields.io/badge/YouTube-subscribe-FF0000" alt="YouTube" /></a>
  <a href="https://github.com/code-with-antonio/messagekit"><img src="https://img.shields.io/github/stars/code-with-antonio/messagekit?style=social" alt="GitHub stars" /></a>
</p>

> **Prompt:** "Send Antonio a Telegram message saying the build shipped."
>
> **Agent:** Uses MessageKit's `telegram` MCP tool with `{ "chatId": "...", "message": "The build shipped." }`, backed by the same core operation available from the CLI and Skill.

## What Is MessageKit?

MessageKit is both a tutorial and a boilerplate for modern agent tooling. It shows how one shared operation can become a complete agent-facing toolkit: a CLI command, a local MCP tool, a remote MCP server, and Skill instructions.

The example operation sends Telegram messages, but the structure is intentionally easy to replace. Swap the operation in `packages/core`, update the adapters, and you have a strong starting point for a different product, internal tool, workflow automation, or agent capability.

The central pattern is:

```text
core capability -> CLI command -> MCP tool -> Skill instructions
```

Business logic lives in `packages/core`. Every other package is an adapter, so agents, scripts, and humans all use the same implementation instead of drifting copies.

## Who This README Is For

Start with the section that matches your goal:

- [Use MessageKit](#use-messagekit): Install the published CLI, local MCP server, and Skill.
- [Fork Or Adapt MessageKit](#fork-or-adapt-messagekit): Turn the boilerplate into your own agent tooling project.
- [Run Locally](#run-locally): Develop the tutorial or modify the packages from source.
- [Publish Packages To NPM](#publish-packages-to-npm): Release notes for maintainers.

## What Is Included

- `packages/core`: Shared schemas and operations.
- `packages/cli`: Human/script CLI adapter.
- `packages/local-mcp`: Local MCP stdio server adapter for AI clients.
- `apps/remote-mcp`: Remote MCP HTTP adapter for deployed clients.
- `packages/skills/messagekit`: Agent-facing usage instructions.

## Prerequisites

- A Telegram bot token.
- Node.js for published package usage.
- Bun if you want to run or adapt this repository locally.
- A Node-compatible MCP client if you want to connect the local MCP server.

## Use MessageKit

Use this path when you want the published MessageKit tools, not the source workspace.

### CLI

Install the CLI globally:

```bash
npm install -g @codewithantonio/messagekit
```

Configure your Telegram bot token:

```bash
messagekit init --telegram-bot-token "<bot-token>"
```

Send a message:

```bash
messagekit telegram "<chat-id>" "Hello from MessageKit"
```

Use JSON output when scripting or when an agent needs to parse the result:

```bash
messagekit telegram "<chat-id>" "Hello from MessageKit" --json
```

Expected JSON output:

```json
{
  "ok": true,
  "chatId": "<chat-id>",
  "messageId": 123
}
```

CLI config is stored at `~/.config/messagekit/config.json`.

### Local MCP

Install the local MCP stdio server globally:

```bash
npm install -g @codewithantonio/messagekit-mcp
```

Configure your MCP client to run `messagekit-mcp` and pass `TELEGRAM_BOT_TOKEN` through the server environment:

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

If your MCP client can execute npm packages directly, skip the global install:

```json
{
  "mcpServers": {
    "messagekit": {
      "command": "npx",
      "args": ["-y", "@codewithantonio/messagekit-mcp"],
      "environment": {
        "TELEGRAM_BOT_TOKEN": "<bot-token>"
      }
    }
  }
}
```

Available MCP tools:

- `telegram`: Accepts `{ chatId, message }` and returns `{ ok, chatId, messageId }`.

Do not include Telegram bot tokens in MCP tool arguments. The local MCP server reads the token from `TELEGRAM_BOT_TOKEN`.

### Skill

Install the MessageKit Skill with your skill manager:

```bash
npx skills add https://github.com/code-with-antonio/messagekit/tree/main/packages/skills/messagekit
```

The Skill tells agents when to use the MCP `telegram` tool, when to fall back to the CLI, why `--json` matters for parsing, and why `@codewithantonio/messagekit-core` is only an implementation detail.

CLI fallback example from the Skill:

```bash
messagekit init --telegram-bot-token "<bot-token>"
messagekit telegram "<chat-id>" "Hello from MessageKit" --json
```

### Remote MCP

This repository includes a remote MCP HTTP server, but MessageKit does not provide a hosted public endpoint.

For remote MCP usage, deploy your own copy of `apps/remote-mcp`. The server exposes `POST /mcp` and expects a per-request bearer token:

```http
Authorization: Bearer <telegram-bot-token>
```

Example OpenCode remote MCP config after you deploy your own server:

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

This keeps Telegram bot tokens user-specific and client-provided without exposing them as MCP tool arguments.

## Fork Or Adapt MessageKit

Use this path when MessageKit is a starting point for something else. The Telegram operation is deliberately small so you can replace it with your own API wrapper, internal workflow, SaaS integration, developer tool, or automation.

### What To Keep

Keep the dependency direction:

```text
packages/core        -> shared schemas and operations
packages/cli         -> command-line adapter backed by core
packages/local-mcp   -> local MCP stdio adapter backed by core
apps/remote-mcp      -> remote MCP HTTP adapter backed by core
packages/skills/...  -> agent-facing instructions and fallback guidance
```

Keep business logic in `packages/core`. Adapters should only parse inputs, read credentials from the right place, call core, and format results.

```text
CLI command = parse input + call core + print output
MCP tool    = validate input + call core + return structured result
Remote MCP  = read request auth + validate input + call core
Skill       = instructions for when/how to use CLI or MCP
```

### What To Replace

Most forks replace these MessageKit-specific pieces:

- Package names in `package.json` files.
- Binary names such as `messagekit` and `messagekit-mcp`.
- The Telegram operation in `packages/core/src/schemas.ts` and `packages/core/src/operations.ts`.
- CLI commands in `packages/cli/src/index.ts`.
- MCP tool registrations in `packages/local-mcp/src/index.ts` and `apps/remote-mcp/src/index.ts`.
- Skill metadata and instructions in `packages/skills/messagekit/SKILL.md`.
- README install, configuration, and verification commands.

### Add A New Operation

Follow the explicit registration flow:

1. Add input and output schemas in `packages/core/src/schemas.ts`.
2. Add the operation function in `packages/core/src/operations.ts`.
3. Export it through `packages/core/src/index.ts` when needed.
4. Add a CLI command in `packages/cli/src/index.ts`.
5. Add a local MCP tool in `packages/local-mcp/src/index.ts`.
6. Add a remote MCP tool in `apps/remote-mcp/src/index.ts` when remote support is part of your project.
7. Add usage notes in your Skill `SKILL.md`.
8. Add manual verification commands to the README.

MessageKit intentionally keeps registration explicit. Do not introduce a shared operation registry until the adapter boundaries are clear.

### Credential Pattern

MessageKit uses three credential paths because each interface has a different audience:

- CLI reads a persisted local user config created by `messagekit init`.
- Local MCP reads environment variables provided by the MCP client.
- Remote MCP reads per-request authorization headers.

For your own project, keep credentials out of MCP tool input schemas unless the credential is genuinely part of the operation payload.

## Run Locally

Use this path when you are following the tutorial, maintaining the repo, or changing packages before publishing.

Install workspace dependencies:

```bash
bun install
```

Run the CLI from source:

```bash
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit" --json
```

Start the local MCP stdio server from source:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:local-mcp
```

Expected behavior: the process stays open and waits for MCP messages over stdio. Stop it with `Ctrl-C` when testing manually.

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

Start the remote MCP HTTP server from source:

```bash
bun run dev:remote-mcp
```

Expected behavior: the server listens on `PORT` or `3000` by default and exposes `POST /mcp`.

### Local Linked Binary

Use `bun link` to test the CLI as a real `messagekit` command before publishing:

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

### Verification Commands

Run these before reporting implementation work complete:

```bash
bun install
bun run format
bun run lint
bun run typecheck
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit" --json
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:local-mcp
bun run dev:remote-mcp
```

Manual remote verification should confirm the server starts on `PORT` or `3000`, missing `Authorization` is rejected, and a valid bearer token lets the remote `telegram` MCP tool call `@codewithantonio/messagekit-core`.

## Architecture Details

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
- Closes the per-request MCP server after handling the request.

`packages/skills/messagekit` owns agent instructions:

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

## Publish Packages To NPM

This section is for MessageKit maintainers and fork authors publishing adapted packages. Normal users can skip it.

`@codewithantonio/messagekit-core` is the shared implementation package used by the CLI, MCP servers, and downstream programmatic consumers. Publish it from `packages/core`, not from the repository root.

`@codewithantonio/messagekit` is the published CLI package. It depends on the published core package, so publish core first whenever a release includes core changes.

`@codewithantonio/messagekit-mcp` is the published local MCP stdio server package. It also depends on the published core package, so publish core first whenever a release includes core changes.

### Version Bumps

npm versions are immutable. Before publishing, choose versions that have not already been published.

If core changed, bump `packages/core/package.json` first:

```json
{
  "name": "@codewithantonio/messagekit-core",
  "version": "0.1.4"
}
```

Then update the CLI and local MCP dependencies on core to the published semver range:

```json
{
  "dependencies": {
    "@codewithantonio/messagekit-core": "^0.1.4"
  }
}
```

Use actual semver for `@codewithantonio/messagekit-core` in published package manifests, not `workspace:*`. Published npm packages cannot rely on workspace-only dependency ranges. Bun can still link the local workspace package during development because the dependency name matches a workspace package.

If the CLI changed, bump `packages/cli/package.json` and keep the CLI's displayed version in `packages/cli/src/index.ts` in sync with it.

If the local MCP server changed, bump `packages/local-mcp/package.json` and keep the MCP server version in `packages/local-mcp/src/index.ts` in sync with it.

After editing versions, refresh the lockfile from the repository root:

```bash
bun install
```

### Pre-Publish Checks

Run the full workspace checks before publishing any package:

```bash
bun run release:check
```

This script runs formatting checks, linting, typechecking, and all publishable package builds. Use `bun run build:core`, `bun run build:cli`, or `bun run build:local-mcp` when checking only one package build.

Package builds run through `tsdown`, which produces native Node ESM output in `dist` for publishing while keeping source imports clean. `tsdown` requires Node.js 22.18.0 or newer at build time, but the emitted package output targets the supported Node runtime.

### Git Commit Timing

Commit release preparation changes before running `npm publish`. The commit should include version bumps, dependency range updates, lockfile updates, and documentation changes. Publishing from a committed state makes the npm package traceable to a specific repository revision and avoids publishing local edits that are not recorded in git.

After the publish succeeds, verify npm metadata and consider creating a git tag for the published version. If publishing fails before the package is accepted by npm, fix the issue, rerun the checks, and commit the fix before trying again. If npm accepts the publish but a later verification step fails, do not reuse the same version; bump to a new version for the next publish because npm versions are immutable.

### Publish Core

Run the full publish workflow:

```bash
bun run release:pack:core
cd packages/core
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
bun run release:pack:cli
cd packages/cli
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

### Publish Local MCP

Publish the local MCP package only after its `@codewithantonio/messagekit-core` dependency points at a core version that already exists on npm.

Run the local MCP publish workflow:

```bash
bun run release:pack:local-mcp
cd packages/local-mcp
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
npm view @codewithantonio/messagekit-mcp version
npm install -g @codewithantonio/messagekit-mcp
command -v messagekit-mcp
npm uninstall -g @codewithantonio/messagekit-mcp
```

To manually verify runtime startup, run `TELEGRAM_BOT_TOKEN="<bot-token>" messagekit-mcp` and stop the stdio server with `Ctrl-C`.

## Troubleshooting

If `bun --filter` cannot find a package, run `bun install` from the repository root and confirm the package name matches the workspace package name.

If TypeScript cannot resolve workspace packages, confirm each package has `"type": "module"`, an `exports` entry, and a dependency that can resolve locally. Internal unpublished packages can use `"workspace:*"`; published packages such as `@codewithantonio/messagekit` and `@codewithantonio/messagekit-mcp` should use real npm semver ranges for published dependencies.

If the MCP server appears to hang, that is expected for stdio mode. It waits for MCP client messages until the process is stopped.

If an MCP client cannot start the server, confirm the command is available on `PATH`, use `npx -y @codewithantonio/messagekit-mcp`, or use an absolute path in local development config.

If CLI output is difficult to parse in scripts, pass `--json` and parse stdout as JSON.

If Telegram requests fail from the CLI, run `messagekit init` and confirm the bot can send messages to the target chat.

If Telegram requests fail from MCP, confirm the MCP client config provides `TELEGRAM_BOT_TOKEN` in the server `environment`.
