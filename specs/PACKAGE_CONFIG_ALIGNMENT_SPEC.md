# Package Config Alignment Spec

## Goal

Make the build, bundle, and publish configuration consistent across:

- `packages/core`
- `packages/cli`
- `packages/local-mcp`

These packages are all public npm packages that build TypeScript source into ESM output under `dist`. Their package metadata and build configuration should only differ when the package role requires it.

## Package Roles

`@codewithantonio/messagekit-core` is the shared implementation library.

It should expose importable ESM library entrypoints and TypeScript declarations.

`@codewithantonio/messagekit` is the human-facing CLI.

It should expose the `messagekit` binary and may also expose its built module entrypoint for package metadata completeness.

`@codewithantonio/messagekit-mcp` is the local MCP stdio server.

It should expose the `messagekit-mcp` binary and may also expose its built module entrypoint for package metadata completeness.

## Current Discrepancies

The three packages are mostly aligned, but these differences do not appear to have a strong reason to remain different:

- `packages/local-mcp` does not have `tsconfig.build.json`, while `packages/core` and `packages/cli` do.
- `packages/core` declares `module` and `exports`, while `packages/cli` and `packages/local-mcp` do not.
- `packages/local-mcp` uses `"messagekit-mcp": "dist/index.js"`, while `packages/cli` uses a `./dist/index.js` bin path.
- `packages/core` uses `bun-types`, while `packages/cli` and `packages/local-mcp` use `@types/node`.
- `bun.lock` contains stale package versions and dependency ranges compared to the current package manifests.

## Target Package Metadata

All three packages should keep these common fields when applicable:

```json
{
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
  }
}
```

`packages/cli` should keep its CLI binary:

```json
{
  "bin": {
    "messagekit": "./dist/index.js"
  }
}
```

`packages/local-mcp` should keep its MCP server binary, with the path normalized to match the CLI package style:

```json
{
  "bin": {
    "messagekit-mcp": "./dist/index.js"
  }
}
```

`packages/core` should not add a `bin` field.

## Target Scripts

Keep the existing script pattern for packages that have an executable source entrypoint:

```json
{
  "scripts": {
    "build": "tsdown",
    "dev": "bun run src/index.ts",
    "pack:dry": "bun run build && npm pack --dry-run",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "bun run build"
  }
}
```

This applies to:

- `packages/cli`
- `packages/local-mcp`

`packages/core` should keep the library-oriented script set without a `dev` script:

```json
{
  "scripts": {
    "build": "tsdown",
    "pack:dry": "bun run build && npm pack --dry-run",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "bun run build"
  }
}
```

Do not add a `dev` script to `packages/core` unless a real executable development workflow is introduced later.

## Build Config Alignment

All three packages should continue using `tsdown.config.ts` with the same structural settings:

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
    neverBundle: [],
  },
});
```

The `deps.neverBundle` list should remain package-specific:

- `packages/core`: `zod`
- `packages/cli`: `@codewithantonio/messagekit-core`, `commander`, `zod`
- `packages/local-mcp`: `@codewithantonio/messagekit-core`, `@modelcontextprotocol/sdk`

Do not force identical `neverBundle` arrays. Each package should externalize only its own runtime dependencies.

## Build Tsconfig Alignment

Add `packages/local-mcp/tsconfig.build.json` to match the CLI package, because both are Node executable adapter packages:

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

Keep `packages/cli/tsconfig.build.json` equivalent.

Update `packages/core/tsconfig.build.json` to use Node typings if the package uses any Node-facing APIs. If core remains runtime-agnostic and does not use Node globals, either `"types": []` or `"types": ["node"]` is acceptable, but the package should not use `bun-types` without a Bun-specific requirement.

## Dev Dependency Alignment

Use `@types/node` for all three packages unless a package has a concrete Bun-specific type requirement.

Target package-local dev dependencies:

```json
{
  "devDependencies": {
    "@types/node": "latest"
  }
}
```

This keeps the package metadata aligned with the shared `tsdown` target:

```ts
platform: "node",
target: "node20"
```

## Lockfile

Run `bun install` after package manifest changes.

The lockfile should reflect the current package versions and dependency ranges from:

- `packages/core/package.json`
- `packages/cli/package.json`
- `packages/local-mcp/package.json`

Do not manually edit `bun.lock`.

## Non-Goals

Do not make every field identical across all three packages.

Keep role-specific differences:

- `packages/core` should not have a `bin` field.
- `packages/core` does not need a `dev` script.
- `packages/cli` should keep `commander` and `zod` as runtime dependencies.
- `packages/local-mcp` should keep `@modelcontextprotocol/sdk` as a runtime dependency.
- `deps.neverBundle` should remain package-specific.

Do not add a shared config abstraction or code generation. This tutorial should keep package configuration explicit and easy to inspect.

## Implementation Steps

1. Add `module` and `exports` to `packages/cli/package.json`.
2. Add `module` and `exports` to `packages/local-mcp/package.json`.
3. Normalize `packages/local-mcp/package.json` bin path to `./dist/index.js`.
4. Add `packages/local-mcp/tsconfig.build.json` using Node typings.
5. Replace `bun-types` with `@types/node` in `packages/core/package.json`, unless a Bun-specific type requirement is discovered.
6. Run `bun install` to refresh `bun.lock`.
7. Run the verification commands.

## Verification

Run:

```bash
bun run format
bun run lint
bun run typecheck
bun run build:core
bun run build:cli
bun run build:local-mcp
```

Then run package dry-runs:

```bash
bun run release:pack:core
bun run release:pack:cli
bun run release:pack:local-mcp
```

Confirm that each package tarball includes built `dist` files, declarations, source maps, and the package-local README.
