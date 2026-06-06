# Polish And Publish Spec

## Goal

Add maintainability, build, release, and deployment polish after all runtime product behavior exists.

This step prepares SendKit as a publishable and deployable tutorial repository without distracting from the earlier runnable learning path.

## Background

Earlier tutorial steps intentionally avoid quality and publishing mechanics until there is a working product. Once CLI, core, local MCP, and remote MCP exist, the repository can add checks and packaging in a way that feels motivated.

```text
workspace polish owns:
- formatting and linting commands
- typechecking commands
- package build configuration
- npm publish metadata
- release verification
- published package and deployed resource names for the Skill

workspace polish must not own:
- new business operations
- behavior rewrites
- new adapter abstractions
- automated test workflow
```

## Decision

Add quality scripts, publish configuration, and deployment naming after all runtime interfaces exist:

```bash
bun run format
bun run lint
bun run typecheck
bun run release:check
```

Use this step to finalize package metadata around the working architecture before writing the Skill with final published and deployed names.

## Reconstruction Workspace

Build this step in its own git workspace, such as branch `reconstruction/06-polish-and-publish` checked out at `../reconstruction/06-polish-and-publish`.

Start from the completed `../reconstruction/05-cli-config-and-json` workspace. This step should move the reconstructed tutorial repository toward the finished publishable result while intentionally excluding the Skill and repository-internal planning and agent guidance files.

Do not reconstruct:

- `specs/`
- `AGENTS.md`
- `CLAUDE.md`

## Scope

In scope:

- Add OXC formatting and linting configuration.
- Add typecheck script.
- Add `tsdown` package builds where needed.
- Add package-specific `tsconfig.build.json` files where needed for publishing.
- Add publish metadata for publishable packages.
- Add release/check workflow scripts.
- Document package binary and shebang expectations for publishable packages.
- Record the final published package names and deployed remote MCP resource names for the Skill step.
- Update `TEACHER.md` for this reconstruction chapter.

Out of scope:

- Automated tests.
- New SendKit operations.
- OAuth or user accounts.
- Production deployment guidance.
- Dynamic operation registry.
- Skill package and Skill instructions.
- README files and README assets.
- `specs/`.
- `AGENTS.md` and `CLAUDE.md`.

## Target Shape

Quality commands:

```bash
bun run format
bun run lint
bun run typecheck
```

Publish-oriented check:

```bash
bun run release:check
```

## Implementation Notes

- Do not introduce a `bun test` workflow.
- Keep package build config minimal and specific to publishable packages.
- Preserve final public names and commands.
- `packages/core` is a library package, so it should not expose a `bin` field and its source entrypoint should not use a shebang.
- `packages/cli` should expose the `sendkit` binary through `bin`, use a Node shebang in its source entrypoint, and preserve that shebang in built output.
- `packages/local-mcp` should expose the `sendkit-mcp` binary through `bin`, use a Node shebang in its source entrypoint, and preserve that shebang in built output.

## Expected Differences From Main

This step should move the reconstruction as close to the publishable runtime project as possible while still excluding Skill instructions and repository-internal planning and agent guidance files.

Expected differences:

- Reconstruction public names use SendKit, not MessageKit. This includes package names, workspace names, binary names, MCP server names, commands, and teaching examples.
- `specs/`, `AGENTS.md`, and `CLAUDE.md` remain excluded even though they exist on `main`.
- `packages/skills/sendkit` remains excluded until the final Skill step so it can use the proper published package names and deployed resource names.
- README files and README assets remain excluded from this reconstruction step.
- Any tutorial-only `TEACHER.md` content may differ from `main` when needed to teach the reconstruction chapter.

Expected parity:

- All tracked, non-excluded source files, package metadata, build config, public commands, and runtime behavior that are not Skill-specific should match `main` unless an expected difference above applies.
- Quality scripts and release checks should match `main`.
- Published package names and deployed remote MCP resource names should be finalized before the Skill step starts.

## File Changes

```text
package.json                         -> quality, build, and release scripts
.oxfmtrc.json                        -> formatter config
.oxlintrc.json                       -> lint config
packages/core/tsdown.config.ts       -> core build config
packages/cli/tsdown.config.ts        -> CLI build config
packages/local-mcp/tsdown.config.ts  -> local MCP build config
packages/core/tsconfig.build.json    -> core declaration/build TypeScript config
packages/cli/tsconfig.build.json     -> CLI declaration/build TypeScript config
packages/local-mcp/tsconfig.build.json -> local MCP declaration/build TypeScript config
tsconfig.json                        -> final workspace TypeScript configuration
TEACHER.md                           -> final teacher-facing manual verification guide
```

## Teacher Guide Updates

`TEACHER.md` must document only this step's new teaching and verification needs. Include:

- Why quality tooling is introduced after runtime behavior exists: earlier chapters prioritize runnable interfaces before polish and publishing mechanics.
- The exact quality and release-check commands and what each one proves.
- Explain that release checks prove packaging/build readiness, while manual Telegram, local MCP, and remote MCP verification still prove runtime behavior.
- Explain where the final published package names and deployed remote MCP resource names are recorded for the Skill chapter.
- Explain that polish is where the project becomes publishable and deployable, while the Skill remains deferred until final package and resource names exist.

## Implementation Steps

1. Add formatter and linter dependencies and config.
2. Add root quality scripts.
3. Add package build configuration with `tsdown` and `tsconfig.build.json` where needed.
4. Add publish metadata and release check script.
5. Record final published package names and deployed remote MCP resource names.
6. Run format, lint, typecheck, and release check.

## Verification

Run from the workspace root:

```bash
bun run format
bun run lint
bun run typecheck
bun run release:check
```

Manual verification should cover:

- CLI commands still work.
- Local MCP still starts.
- Remote MCP still starts.
- Published package names and deployed remote MCP resource names are known for the Skill step.
- Skill package files are still absent and deferred to the final step.

## Acceptance Criteria

- Quality scripts exist and pass.
- Publish-oriented packages have build config and package metadata.
- Published package names and deployed remote MCP resource names are finalized for the Skill step.
- Skill package files are not introduced yet.
- README files and README assets are not introduced.
- No automated test workflow is introduced.

## Non-Goals

- Do not reconstruct `specs/`, `AGENTS.md`, or `CLAUDE.md` even though they exist on `main`.
- Do not add new operations.
- Do not add code generation.
- Do not add production hosting/deployment docs.
- Do not add auth beyond existing Telegram token handling.
- Do not add Skill docs until the final reconstruction step.
