# Extensionless Source Imports Spec

## Goal

Allow TypeScript source files in `packages/core` and `packages/cli` to use extensionless relative imports, such as `./schemas`, instead of writing runtime `.js` extensions in source.

The published packages must still run as native Node ESM from `dist` without requiring a bundler at runtime.

## Current Reason For `.js` Source Imports

The README currently documents this requirement for npm publishing:

```text
Because the published packages run as native Node ESM, relative imports in TypeScript source should include the runtime `.js` extension, for example `./schemas.js`. TypeScript resolves that to the local `.ts` source during development and preserves the `.js` specifier in compiled output so Node can load the package without a bundler.
```

That reasoning is correct for plain `tsc` output. TypeScript does not rewrite extensionless relative ESM specifiers during emit. If source imports `./schemas`, the compiled JavaScript also imports `./schemas`, which Node ESM will not resolve in published packages.

## Desired Source Style

Source files in `packages/core/src` and `packages/cli/src` should be allowed to write:

```ts
export * from "./schemas";
export * from "./operations";
```

and:

```ts
import { telegramMessageOptionsSchema } from "./schemas";
```

Do not require source authors to write:

```ts
export * from "./schemas.js";
```

## Minimal Build Change

Use `tsdown` as the package build tool for `packages/core` and `packages/cli`.

`tsdown` is a TypeScript package bundler powered by Rolldown and Oxc. It lets source files use extensionless relative imports while producing publishable ESM output for Node. It is a better forward-looking choice than `tsup` for this tutorial because it targets the same library-bundling use case while being actively maintained.

`tsdown` requires Node.js 22.18.0 or newer at build time. This is a build-time requirement only; the published package output should target the Node runtime version MessageKit supports.

Install one workspace dev dependency:

```bash
bun add -d tsdown
```

Update package build scripts that publish Node ESM from `dist`:

```json
{
  "scripts": {
    "build": "tsdown"
  }
}
```

Apply this to:

- `packages/core/package.json`
- `packages/cli/package.json`

Keep `tsc --noEmit` for typechecking through the existing `typecheck` scripts.

## Core Build Config

Add `packages/core/tsdown.config.ts`:

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
  deps: {
    neverBundle: ["zod"],
  },
});
```

Keep `zod` external because it is a runtime dependency and exported schemas depend on it.

The core package should continue publishing these public files:

```text
dist/index.js
dist/index.d.ts
dist/index.js.map
```

It is acceptable if `tsdown` bundles internal modules such as `schemas.ts` and `operations.ts` into `dist/index.js` instead of emitting separate `dist/schemas.js` and `dist/operations.js` files. The public package export remains `.` through `dist/index.js` and `dist/index.d.ts`.

## CLI Build Config

Add `packages/cli/tsdown.config.ts`:

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
  deps: {
    neverBundle: ["@codewithantonio/messagekit-core", "commander", "zod"],
  },
});
```

Keep package dependencies external so the published CLI continues depending on the published `@codewithantonio/messagekit-core`, `commander`, and `zod` packages instead of inlining them.

The CLI package should continue publishing these public files:

```text
dist/index.js
dist/index.d.ts
dist/index.js.map
```

The built `dist/index.js` must preserve the source Node shebang so npm can execute the `messagekit` binary directly. If `tsdown` does not preserve the shebang by default, add the smallest package-local build hook or post-build step needed to restore `#!/usr/bin/env node` at the top of `dist/index.js`.

## TypeScript Config

Keep the root TypeScript configuration using bundler-style resolution:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

This allows extensionless source imports during development and typechecking while leaving `tsdown` responsible for producing Node-compatible published output.

Do not switch these packages to `moduleResolution: "NodeNext"` as part of this change. `NodeNext` would reintroduce TypeScript errors for extensionless ESM imports.

## Source Updates

Remove `.js` from relative imports in `packages/core/src` and `packages/cli/src` only.

Examples for the current core package:

```ts
export * from "./schemas";
export * from "./operations";
```

```ts
import {
  telegramMessageOutputSchema,
  telegramMessageOptionsSchema,
  telegramSendMessageRequestSchema,
  telegramSendMessageResponseSchema,
} from "./schemas";
```

Bare package imports must stay unchanged:

```ts
import { sendTelegramMessage } from "@codewithantonio/messagekit-core";
```

Node built-in imports must stay unchanged:

```ts
import { homedir } from "node:os";
```

## README Update

Replace the README publishing note that tells authors to write `.js` in TypeScript source.

The new guidance should say:

```text
Source files can use extensionless relative imports. Package builds run through `tsdown`, which produces native Node ESM output in `dist` for publishing while keeping source imports clean. `tsdown` requires Node.js 22.18.0 or newer at build time, but the emitted package output targets the supported Node runtime.
```

Keep the explanation near the npm publish guidance because this is a publish/runtime constraint, not core business logic.

## Acceptance Criteria

- `packages/core/src/**/*.ts` does not use `.js` suffixes for relative imports or exports.
- `packages/cli/src/**/*.ts` does not use `.js` suffixes for relative imports or exports.
- `packages/core/package.json` build script runs `tsdown`.
- `packages/cli/package.json` build script runs `tsdown`.
- `tsdown` is available as a workspace development dependency.
- The spec or README documents that `tsdown` requires Node.js 22.18.0 or newer at build time.
- `packages/core/tsdown.config.ts` emits ESM, declarations, sourcemaps, targets Node, and keeps `zod` external.
- `packages/cli/tsdown.config.ts` emits ESM, declarations, sourcemaps, targets Node, preserves the Node shebang, and keeps runtime dependencies external.
- `bun run --filter @codewithantonio/messagekit-core build` succeeds.
- `bun run --filter @codewithantonio/messagekit build` succeeds.
- Built JavaScript in `packages/core/dist` can be imported by native Node ESM without a bundler.
- Built JavaScript in `packages/cli/dist/index.js` can be executed by Node through the `messagekit` binary.
- `bun run format` succeeds.
- `bun run lint` succeeds.
- `bun run typecheck` succeeds.

## Non-Goals

- Do not add a larger bundler stack such as Rollup or Vite.
- Do not change package public names, export maps, or dependency direction.
- Do not change Telegram behavior.
- Do not change MCP, Skill, or remote MCP source imports as part of this spec unless a later spec expands the scope.
- Do not add automated tests for this tutorial step.
