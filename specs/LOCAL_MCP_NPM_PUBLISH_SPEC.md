# Local MCP NPM Publish Spec

## Goal

Make `packages/local-mcp` publishable to npm as `@codewithantonio/messagekit-mcp` with a `messagekit-mcp` binary.

The published package should install through npm-compatible package managers and run as a local MCP stdio server from built JavaScript. It should not publish raw TypeScript source as the executable entrypoint.

## Package Role

`@codewithantonio/messagekit-mcp` is the local agent-facing MCP adapter for MessageKit.

It owns:

- Creating the local MCP stdio server.
- Registering the `telegram` MCP tool.
- Reading `TELEGRAM_BOT_TOKEN` from the MCP client environment.
- Returning MCP `content` and `structuredContent` responses.

It must not own:

- Telegram Bot API implementation details.
- Shared input or output schemas that belong in `@codewithantonio/messagekit-core`.
- CLI command parsing or local CLI config.
- Skill instructions.

## Current Issue

The current package manifest is suitable for workspace development only:

```json
{
  "bin": {
    "messagekit-mcp": "./src/index.ts"
  },
  "dependencies": {
    "@codewithantonio/messagekit-core": "workspace:*",
    "@modelcontextprotocol/sdk": "^1.21.0"
  }
}
```

This is not the desired npm contract because:

- npm consumers should execute built JavaScript from `dist`, not workspace TypeScript source.
- Published packages cannot depend on `workspace:*` ranges.
- The package does not declare `files`, `publishConfig`, `main`, `types`, or a tsdown publish build.
- The source uses a Bun shebang, which makes the published MCP server require Bun instead of Node.
- The package does not have a package-local README for npm.

## Runtime Positioning

The published local MCP server should run on Node.js.

Use the executable shebang:

```ts
#!/usr/bin/env node
```

This matches normal npm MCP server expectations: users and MCP clients should be able to run `messagekit-mcp` after installing the package without also installing Bun.

Bun should remain the workspace package manager and development runner, but it should not be required to execute the published MCP binary.

Use tsdown for the publish build, matching `packages/core` and `packages/cli`.

Do not bundle runtime dependencies or add a separate runtime abstraction as part of this publish step. The current adapter is small and only needs the MCP SDK, the shared core package, and `process.env`.

## Target Manifest

Update `packages/local-mcp/package.json` to publish built output:

```json
{
  "name": "@codewithantonio/messagekit-mcp",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "messagekit-mcp": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md"],
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "tsdown",
    "dev": "bun run src/index.ts",
    "pack:dry": "bun run build && npm pack --dry-run",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "bun run build"
  },
  "dependencies": {
    "@codewithantonio/messagekit-core": "^0.1.0",
    "@modelcontextprotocol/sdk": "^1.21.0"
  },
  "devDependencies": {
    "@types/node": "latest"
  }
}
```

Keep `@modelcontextprotocol/sdk` as a regular dependency because the installed MCP server needs it at runtime.

Use the published semver range for `@codewithantonio/messagekit-core` before publishing. Do not publish the MCP package while it still contains `workspace:*` dependency ranges.

The workspace already provides `tsdown` as a root dev dependency. Keep that consistent unless package-local dev dependencies become necessary for publishing outside the workspace.

## Build Config

Add `packages/local-mcp/tsdown.config.ts` for publish output:

```ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  platform: "node",
  target: "node20",
  outDir: "dist",
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  deps: {
    neverBundle: ["@codewithantonio/messagekit-core", "@modelcontextprotocol/sdk"],
  },
});
```

The package should emit:

```text
packages/local-mcp/dist/index.js
packages/local-mcp/dist/index.d.ts
packages/local-mcp/dist/index.js.map
packages/local-mcp/dist/index.d.ts.map
```

The built `dist/index.js` must preserve the Node shebang so the npm-installed `messagekit-mcp` binary can execute directly through Node.

If tsdown does not preserve the shebang in the current configuration, add the smallest package-local build step needed to restore it after compilation. Do not introduce a second bundler for this tutorial step.

## Node Compatibility Changes

Update `packages/local-mcp/src/index.ts` so the published binary targets Node:

```ts
#!/usr/bin/env node
```

Keep the source otherwise focused on the MCP adapter:

- Create an `McpServer`.
- Register the `telegram` tool.
- Read `TELEGRAM_BOT_TOKEN` from `process.env`.
- Call `sendTelegramMessage` from `@codewithantonio/messagekit-core`.
- Connect using `StdioServerTransport`.

Do not add CLI-style flags, config files, prompts, or terminal formatting to the MCP server as part of this publish work. MCP client configuration should provide the environment variable.

## README

Add `packages/local-mcp/README.md` before publishing.

It should include:

- A short description of the MessageKit local MCP server.
- A Node.js runtime requirement.
- Installation with `npm install -g @codewithantonio/messagekit-mcp`.
- The binary name: `messagekit-mcp`.
- The required environment variable: `TELEGRAM_BOT_TOKEN`.
- An MCP client configuration example.
- A note that the MCP tool is named `telegram` and accepts only `chatId` and `message`.
- A note that `@codewithantonio/messagekit-core` is used internally and the MCP package does not duplicate Telegram logic.

Example MCP client configuration:

```json
{
  "mcpServers": {
    "messagekit": {
      "command": "messagekit-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<bot-token>"
      }
    }
  }
}
```

## Core Package Dependency

Publish `@codewithantonio/messagekit-core` before publishing the local MCP package.

The MCP package should depend on the published core package version:

```json
{
  "dependencies": {
    "@codewithantonio/messagekit-core": "^0.1.0"
  }
}
```

Inside the workspace, Bun can still link workspace packages during development. The npm package metadata must not rely on `workspace:*` once published.

## Source Requirements

Keep `packages/local-mcp/src/index.ts` as the single explicit local MCP adapter.

The server should continue to:

- Use `telegramMessageInputSchema.shape` for the MCP tool input schema.
- Keep the bot token out of the MCP tool input.
- Read the bot token from `TELEGRAM_BOT_TOKEN`.
- Return a text content message for normal MCP clients.
- Return the core result as `structuredContent`.

Do not introduce a shared operation registry as part of this publish work. The tutorial should keep operation registration explicit across core, CLI, MCP, and Skill interfaces.

## Package Contents Verification

From `packages/local-mcp`, inspect the npm tarball before publishing:

```bash
bun run build
npm pack --dry-run
```

The dry run should include only expected publish files, especially:

```text
dist/index.js
dist/index.d.ts
package.json
README.md
```

It should not include:

```text
src/
node_modules/
tsdown.config.ts
```

## Local Runtime Verification

After building, verify the binary can start under Node:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" node packages/local-mcp/dist/index.js
```

Because this is a stdio MCP server, the command will wait for MCP protocol input. For manual publish readiness, the important check is that Node starts the process without module resolution or runtime errors.

Also verify the package binary path through a local package manager link or packed tarball before publishing.

## Publish Workflow

Use npm for the actual publish command:

```bash
cd packages/local-mcp
bun run build
npm pack --dry-run
npm publish --access public
```

Do not publish until:

- `@codewithantonio/messagekit-core` is already published at the referenced version.
- `package.json` no longer contains `workspace:*` dependency ranges.
- `npm pack --dry-run` shows only expected files.
- The built binary starts under Node.

## Repository Verification

After implementing the publish changes, run the repository checks from the workspace root:

```bash
bun run format
bun run lint
bun run typecheck
```

These checks are required before reporting the implementation complete.
