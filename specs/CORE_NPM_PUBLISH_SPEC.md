# Core NPM Publish Spec

## Goal

Make `packages/core` publishable to npm as `@codewithantonio/messagekit-core`.

The published package should work as a normal TypeScript-friendly ESM library for Node, Bun, and downstream MessageKit packages. It should not expose raw workspace source files as the public npm entrypoint.

## Package Role

`@codewithantonio/messagekit-core` is the shared implementation package for MessageKit.

It owns:

- Zod schemas.
- Public TypeScript types derived from those schemas.
- Reusable operations such as `sendTelegramMessage`.

It must not own:

- CLI argument parsing.
- MCP SDK integration.
- Terminal output formatting.
- Process exits.
- Skill instructions.

## Current Issue

The current package manifest exports TypeScript source directly:

```json
{
  "exports": {
    ".": "./src/index.ts"
  }
}
```

This is convenient inside the workspace, but it is not the desired npm contract. Published consumers should import compiled JavaScript and receive declaration files.

## Target Manifest

Update `packages/core/package.json` to publish the built `dist` output:

```json
{
  "name": "@codewithantonio/messagekit-core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist", "README.md"],
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "bun run build"
  },
  "dependencies": {
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "bun-types": "latest"
  }
}
```

Keep `zod` as a regular dependency because exported schemas and runtime validation require it in consumer projects.

## Build Config

Add `packages/core/tsconfig.build.json` for publish output:

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
    "types": []
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

The package should emit:

```text
packages/core/dist/index.js
packages/core/dist/index.d.ts
packages/core/dist/schemas.js
packages/core/dist/schemas.d.ts
packages/core/dist/operations.js
packages/core/dist/operations.d.ts
```

## README

Add `packages/core/README.md` before publishing.

It should include:

- A short description of MessageKit Core.
- Installation with `npm install @codewithantonio/messagekit-core`.
- A minimal `sendTelegramMessage` usage example.
- A note that CLI and MCP packages are the preferred user-facing interfaces for most users.

Example usage:

```ts
import { sendTelegramMessage } from "@codewithantonio/messagekit-core";

const result = await sendTelegramMessage({
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  chatId: "123456789",
  message: "Hello from MessageKit",
});

console.log(result.messageId);
```

## Source Requirements

Keep the public exports explicit through `packages/core/src/index.ts`:

```ts
export * from "./schemas";
export * from "./operations";
```

Do not add a shared operation registry as part of this publish work. The tutorial should keep operation registration explicit across core, CLI, MCP, and Skill interfaces.

## Workspace Consumer Impact

Workspace packages should continue depending on core with:

```json
{
  "dependencies": {
    "@codewithantonio/messagekit-core": "workspace:*"
  }
}
```

After changing the core export map to `dist`, local development commands may require `packages/core` to be built before running consumers through package imports.

If that becomes disruptive, prefer adding package-level build steps or root scripts. Do not re-export `src` through npm just to preserve local convenience.

## Package Contents Verification

From `packages/core`, inspect the npm tarball before publishing:

```bash
bun run build
npm pack --dry-run
```

The dry run should include only expected publish files, especially:

```text
dist/index.js
dist/index.d.ts
dist/schemas.js
dist/schemas.d.ts
dist/operations.js
dist/operations.d.ts
package.json
README.md
```

It should not include:

```text
src/
node_modules/
tsconfig.build.json
```

## Publish Workflow

Use npm for the actual publish command:

```bash
cd packages/core
bun run build
npm pack --dry-run
npm publish --access public
```

Only publish after the package name, version, tarball contents, and README are verified.

## Acceptance Criteria

- `packages/core/package.json` points `main`, `module`, `types`, and `exports` at `dist` files.
- `packages/core/package.json` includes `files` so npm publishes only the intended package surface.
- `packages/core/package.json` includes `publishConfig.access` set to `public`.
- `packages/core` has a build script that emits JavaScript and declaration files.
- `packages/core/README.md` documents install and programmatic usage.
- `bun run --filter @codewithantonio/messagekit-core build` succeeds.
- `bun run format` succeeds.
- `bun run lint` succeeds.
- `bun run typecheck` succeeds.
- `npm pack --dry-run` from `packages/core` shows a clean publish tarball.
