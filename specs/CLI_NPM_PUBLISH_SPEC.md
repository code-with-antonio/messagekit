# CLI NPM Publish Spec

## Goal

Make `packages/cli` publishable to npm as `@codewithantonio/messagekit` with a `messagekit` binary.

The published package should install through npm-compatible package managers and expose a stable command-line interface. It should not publish raw TypeScript source as the executable entrypoint.

## Package Role

`@codewithantonio/messagekit` is the human-facing MessageKit CLI.

It owns:

- Commander command definitions.
- Local CLI configuration stored under `~/.config/messagekit/config.json`.
- Human-readable terminal output.
- `--json` output for scriptable usage.

It must not own:

- Telegram Bot API implementation details.
- Shared input or output schemas that belong in `@codewithantonio/messagekit-core`.
- MCP SDK integration.
- Skill instructions.

## Current Issue

The current package manifest is suitable for workspace development and local Bun linking:

```json
{
  "bin": {
    "messagekit": "./src/index.ts"
  },
  "dependencies": {
    "@codewithantonio/messagekit-core": "workspace:*",
    "commander": "^14.0.2"
  }
}
```

This is not the desired npm contract because:

- npm consumers should execute built JavaScript from `dist`, not workspace TypeScript source.
- Published packages cannot depend on `workspace:*` ranges.
- The CLI imports `zod` directly but does not currently list it as a dependency.
- The package does not declare `files`, `publishConfig`, `main`, `types`, or a publish build.
- The package does not have a package-local README for npm.

## Runtime Positioning

The published CLI should run on Node.js.

Use the executable shebang:

```ts
#!/usr/bin/env node
```

This matches normal npm CLI expectations: users should be able to install `@codewithantonio/messagekit` globally and run `messagekit` without also installing Bun.

Bun should remain the workspace package manager and development runner, but it should not be required to execute the published CLI.

Do not bundle the CLI or add a separate runtime abstraction as part of this publish step. The current CLI already uses Node built-ins for filesystem, path, OS, readline, and process behavior, so the Node compatibility pass should stay small.

## Target Manifest

Update `packages/cli/package.json` to publish built output:

```json
{
  "name": "@codewithantonio/messagekit",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "messagekit": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md"],
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "dev": "bun run src/index.ts",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "bun run build"
  },
  "dependencies": {
    "@codewithantonio/messagekit-core": "^0.1.0",
    "commander": "^14.0.2",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "@types/node": "latest"
  }
}
```

Keep `commander` and `zod` as regular dependencies because the installed CLI needs them at runtime.

Use the published semver range for `@codewithantonio/messagekit-core` before publishing. Do not publish the CLI while it still contains `workspace:*` dependency ranges.

## Build Config

Add `packages/cli/tsconfig.build.json` for publish output:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

The package should emit:

```text
packages/cli/dist/index.js
packages/cli/dist/index.d.ts
packages/cli/dist/index.js.map
packages/cli/dist/index.d.ts.map
```

The built `dist/index.js` must preserve the Node shebang so the npm-installed `messagekit` binary can execute directly through Node.

If TypeScript does not preserve the shebang in the current compiler configuration, add the smallest package-local build step needed to restore it after compilation. Prefer a simple package-local script over introducing a bundler for this tutorial step.

## Node Compatibility Changes

Update `packages/cli/src/index.ts` so it does not rely on Bun-only or browser-style runtime helpers for CLI output.

Replace the current JSON output implementation:

```ts
console.log(await Response.json(telegramMessage).text());
```

with Node-compatible JSON serialization:

```ts
console.log(JSON.stringify(telegramMessage));
```

Also update the source shebang from `#!/usr/bin/env bun` to `#!/usr/bin/env node` before building for npm.

Keep `bun run src/index.ts` available for workspace development only if it still works with the Node shebang. Otherwise, prefer running the built CLI for publish verification instead of making the npm binary depend on Bun.

## README

Add `packages/cli/README.md` before publishing.

It should include:

- A short description of the MessageKit CLI.
- A Node.js runtime requirement.
- Installation with `npm install -g @codewithantonio/messagekit`.
- Configuration with `messagekit init --telegram-bot-token "<bot-token>"`.
- Sending a Telegram message with `messagekit telegram "<chat-id>" "Hello from MessageKit"`.
- JSON output with `messagekit telegram "<chat-id>" "Hello from MessageKit" --json`.
- A note that the CLI uses `@codewithantonio/messagekit-core` internally and does not duplicate Telegram logic.
- A note that MCP remains the primary agent-facing interface in the tutorial, while the CLI is best for manual usage, scripting, and debugging.

## Core Package Dependency

Publish `@codewithantonio/messagekit-core` before publishing the CLI.

The CLI package should depend on the published core package version:

```json
{
  "dependencies": {
    "@codewithantonio/messagekit-core": "^0.1.0"
  }
}
```

Inside the workspace, Bun can still link workspace packages during development. The npm package metadata must not rely on `workspace:*` once published.

## Source Requirements

Keep `packages/cli/src/index.ts` as the single explicit CLI adapter.

The CLI should continue to:

- Define `messagekit init`.
- Define `messagekit telegram <chatId> <message>`.
- Read the Telegram bot token from local config.
- Call `sendTelegramMessage` from `@codewithantonio/messagekit-core`.
- Print human-readable output by default.
- Print structured JSON when `--json` is passed.

Do not introduce a shared operation registry as part of this publish work.

## Package Contents Verification

From `packages/cli`, inspect the npm tarball before publishing:

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
tsconfig.build.json
```

## Install Verification

Before testing the packed npm install, remove any existing Bun link so `messagekit` cannot resolve to the workspace package by accident:

```bash
cd packages/cli
bun unlink
```

After unlinking and packing, verify the package as an installed CLI before publishing:

```bash
cd packages/cli
bun run build
npm pack
npm install -g ./codewithantonio-messagekit-0.1.0.tgz
messagekit --help
messagekit init --telegram-bot-token "<bot-token>"
messagekit telegram "<chat-id>" "Hello from MessageKit"
messagekit telegram "<chat-id>" "Hello from MessageKit" --json
```

Uninstall the packed package after manual verification:

```bash
npm uninstall -g @codewithantonio/messagekit
```

## Publish Workflow

Use npm for the actual publish command:

```bash
cd packages/cli
bun run build
npm pack --dry-run
npm publish --access public
```

Only publish after the package name, version, runtime requirement, dependency ranges, tarball contents, README, and installed binary behavior are verified.

## Acceptance Criteria

- `packages/cli/package.json` points `bin`, `main`, and `types` at `dist` files.
- `packages/cli/package.json` includes `files` so npm publishes only the intended package surface.
- `packages/cli/package.json` includes `publishConfig.access` set to `public`.
- `packages/cli/package.json` uses a published semver range for `@codewithantonio/messagekit-core`, not `workspace:*`.
- `packages/cli/package.json` lists every runtime import as a dependency, including `commander` and `zod`.
- `packages/cli` has a build script that emits JavaScript and declaration files.
- The built CLI preserves the `#!/usr/bin/env node` shebang.
- `packages/cli/README.md` documents install, Node.js runtime requirements, configuration, Telegram usage, and JSON output.
- `bun run --filter @codewithantonio/messagekit build` succeeds.
- `bun run format` succeeds.
- `bun run lint` succeeds.
- `bun run typecheck` succeeds.
- `npm pack --dry-run` from `packages/cli` shows a clean publish tarball.
- Any existing Bun link is removed before install verification.
- Installing the packed tarball globally exposes a working `messagekit` command.
