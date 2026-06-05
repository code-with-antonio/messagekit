# Reconstruction File Map

## Goal

Track every file from the finished `main` branch and assign it to a reconstruction step, excluding only files that the reconstruction intentionally does not reproduce.

If a file exists on `main` and is not listed here, the reconstruction specs are incomplete.

## Excluded Files

These files and folders are intentionally not reconstructed:

```text
AGENTS.md
CLAUDE.md
specs/
```

## Step 1: Minimal CLI

These files are introduced from an empty repository:

```text
.env.example
.gitignore
bun.lock
package.json
tsconfig.json
packages/cli/package.json
packages/cli/src/index.ts
TEACHER.md
```

Rationale:

- `tsconfig.json` is required from the first TypeScript chapter so editor and runtime assumptions are not implicit.
- `package.json` and `bun.lock` are required for the runnable Bun CLI workspace.
- `.env.example` is required once the first runnable command reads `TELEGRAM_BOT_TOKEN` from the environment.
- `.gitignore` is required once the repo starts generating dependencies, build output, local env files, or local config artifacts.

## Step 2: Extract Shared Core

These files are introduced or updated:

```text
bun.lock
package.json
packages/cli/package.json
packages/cli/src/index.ts
packages/core/package.json
packages/core/src/index.ts
packages/core/src/operations.ts
packages/core/src/schemas.ts
tsconfig.json
TEACHER.md
```

Rationale:

- `packages/core` is introduced as soon as the minimal CLI has working behavior worth extracting and before MCP needs the same operation.
- Root TypeScript configuration may need path/workspace settings once multiple packages exist.

## Step 3: Local MCP Adapter

These files are introduced or updated:

```text
bun.lock
package.json
packages/local-mcp/package.json
packages/local-mcp/src/index.ts
tsconfig.json
TEACHER.md
```

Rationale:

- `packages/local-mcp` is introduced only when the shared core exists.
- Root package and TypeScript configuration may need workspace updates for the new package.

## Step 4: Remote MCP Adapter

These files are introduced or updated:

```text
apps/remote-mcp/package.json
apps/remote-mcp/src/index.ts
bun.lock
package.json
tsconfig.json
TEACHER.md
```

Rationale:

- `apps/remote-mcp` is introduced directly in its final app location after local MCP is understood.
- Workspace and TypeScript configuration may need updates for the new app.

## Step 5: CLI Config And JSON Output

These files are introduced or updated:

```text
.gitignore
bun.lock
package.json
packages/cli/package.json
packages/cli/src/index.ts
TEACHER.md
```

Rationale:

- CLI config and JSON output are introduced when the project is close to distribution and repeated human CLI usage matters.
- `.gitignore` is updated if local environment or config artifacts need ignoring.

## Step 6: Polish And Publish

These files are introduced or updated:

```text
.oxfmtrc.json
.oxlintrc.json
README.md
assets/sendkit-logo.svg
bun.lock
package.json
packages/cli/README.md
packages/cli/package.json
packages/cli/src/index.ts
packages/cli/tsconfig.build.json
packages/cli/tsdown.config.ts
packages/core/README.md
packages/core/package.json
packages/core/src/index.ts
packages/core/src/operations.ts
packages/core/tsconfig.build.json
packages/core/tsdown.config.ts
packages/local-mcp/README.md
packages/local-mcp/package.json
packages/local-mcp/src/index.ts
packages/local-mcp/tsconfig.build.json
packages/local-mcp/tsdown.config.ts
tsconfig.json
TEACHER.md
```

Rationale:

- Quality tooling, build config, publish metadata, package READMEs, and final root docs are added after all runnable product layers exist.
- `assets/sendkit-logo.svg` is introduced with the final README hero/documentation polish.

## Step 7: SendKit Skill

These files are introduced or updated:

```text
bun.lock
package.json
packages/skills/sendkit/SKILL.md
packages/skills/sendkit/package.json
TEACHER.md
```

Rationale:

- The Skill is introduced last so it can reference final published package names and deployed remote MCP resource names.

## Final Tracked File Checklist

Every tracked, non-excluded file on `main` must appear in one of the step sections above:

```text
.env.example
.gitignore
.oxfmtrc.json
.oxlintrc.json
README.md
apps/remote-mcp/package.json
apps/remote-mcp/src/index.ts
assets/sendkit-logo.svg
bun.lock
package.json
packages/cli/README.md
packages/cli/package.json
packages/cli/src/index.ts
packages/cli/tsconfig.build.json
packages/cli/tsdown.config.ts
packages/core/README.md
packages/core/package.json
packages/core/src/index.ts
packages/core/src/operations.ts
packages/core/src/schemas.ts
packages/core/tsconfig.build.json
packages/core/tsdown.config.ts
packages/local-mcp/README.md
packages/local-mcp/package.json
packages/local-mcp/src/index.ts
packages/local-mcp/tsconfig.build.json
packages/local-mcp/tsdown.config.ts
packages/skills/sendkit/SKILL.md
packages/skills/sendkit/package.json
TEACHER.md
tsconfig.json
```

## Maintenance Rule

When `main` gains, removes, or renames a tracked non-excluded file, update this file map and the relevant step spec in the same change.
