# Polish And Publish Spec

## Goal

Add maintainability, build, release, deployment, and documentation polish after all runtime product behavior exists.

This step prepares SendKit as a publishable and deployable tutorial repository without distracting from the earlier runnable learning path.

## Background

Earlier tutorial steps intentionally avoid quality and publishing mechanics until there is a working product. Once CLI, core, local MCP, and remote MCP exist, the repository can add checks and packaging in a way that feels motivated.

```text
workspace polish owns:
- formatting and linting commands
- typechecking commands
- package build configuration
- npm publish metadata
- package READMEs
- final root README
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

Use this step to finalize docs and package metadata around the working architecture before writing the Skill with final published and deployed names.

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
- Add package READMEs.
- Add final README assets such as the SendKit logo.
- Add publish metadata for publishable packages.
- Add release/check workflow scripts.
- Record the final published package names and deployed remote MCP resource names for the Skill step.
- Expand root README to explain the complete runtime project.
- Document how to add a new operation using the explicit registration flow.

Out of scope:

- Automated tests.
- New SendKit operations.
- OAuth or user accounts.
- Production deployment guidance.
- Dynamic operation registry.
- Skill package and Skill instructions.
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

Final docs should explain:

- What SendKit is for.
- How packages relate to each other.
- How to run the CLI.
- How to run local MCP.
- How to run remote MCP.
- How to configure an MCP client.
- How to add a new operation.
- Why business logic belongs in `packages/core`.
- Which published package names and deployed remote MCP resource names the Skill should use.

## Implementation Notes

- Do not introduce a `bun test` workflow.
- Keep package build config minimal and specific to publishable packages.
- Keep package responsibilities clear in docs.
- Preserve final public names and commands.
- The README should describe the final architecture, not the messy historical path.

## Expected Differences From Main

This step should move the reconstruction as close to the publishable runtime project as possible while still excluding Skill instructions and repository-internal planning and agent guidance files.

Expected differences:

- `specs/`, `AGENTS.md`, and `CLAUDE.md` remain excluded even though they exist on `main`.
- `packages/skills/sendkit` remains excluded until the final Skill step so it can use the proper published package names and deployed resource names.
- Any tutorial-only `TEACHER.md` content may differ from `main` when needed to teach the reconstruction chapter.

Expected parity:

- All tracked, non-excluded source files, package metadata, build config, docs, public commands, and runtime behavior that are not Skill-specific should match `main` unless an expected difference above applies.
- Quality scripts and release checks should match `main`.
- Package READMEs and the root README should match the publish-ready SendKit tutorial naming and architecture for interfaces introduced so far.
- Published package names and deployed remote MCP resource names should be finalized before the Skill step starts.

## File Changes

```text
package.json                         -> quality, build, and release scripts
.oxfmtrc.json                        -> formatter config
.oxlintrc.json                       -> lint config
assets/sendkit-logo.svg              -> final README hero/logo asset
packages/core/tsdown.config.ts       -> core build config
packages/cli/tsdown.config.ts        -> CLI build config
packages/local-mcp/tsdown.config.ts  -> local MCP build config
packages/core/tsconfig.build.json    -> core declaration/build TypeScript config
packages/cli/tsconfig.build.json     -> CLI declaration/build TypeScript config
packages/local-mcp/tsconfig.build.json -> local MCP declaration/build TypeScript config
packages/core/README.md              -> core package README
packages/cli/README.md               -> CLI package README
packages/local-mcp/README.md         -> local MCP package README
README.md                            -> final tutorial documentation and final published/deployed names
tsconfig.json                        -> final workspace TypeScript configuration
TEACHER.md                           -> final teacher-facing manual verification guide
```

## Documentation Updates

Add publish-ready README sections for:

```text
Overview
Architecture
CLI usage
Local MCP usage
Remote MCP usage
MCP client configuration
Adding a new operation
Verification
```

`TEACHER.md` must document only this step's new teaching and verification needs. Include:

- Why quality tooling is introduced after runtime behavior exists: earlier chapters prioritize runnable interfaces before polish and publishing mechanics.
- The exact quality and release-check commands and what each one proves.
- How to verify package READMEs match the package boundaries taught throughout the tutorial.
- How to verify the root README commands match real root scripts.
- Explain that release checks prove packaging/build readiness, while manual Telegram, local MCP, and remote MCP verification still prove runtime behavior.
- Explain where the final published package names and deployed remote MCP resource names are recorded for the Skill chapter.
- Explain the difference between root README documentation and package README documentation: root teaches the whole architecture, package READMEs document installable package responsibilities.
- Explain that polish is where the project becomes publishable and deployable, while the Skill remains deferred until final package and resource names exist.

## Implementation Steps

1. Add formatter and linter dependencies and config.
2. Add root quality scripts.
3. Add package build configuration with `tsdown` and `tsconfig.build.json` where needed.
4. Add package README files.
5. Add final README assets such as the SendKit logo.
6. Add publish metadata and release check script.
7. Record final published package names and deployed remote MCP resource names.
8. Rewrite or expand root README around the publish-ready architecture.
9. Run format, lint, typecheck, and release check.

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
- README commands match package scripts.
- Package READMEs match package responsibilities.
- Published package names and deployed remote MCP resource names are known for the Skill step.
- Skill package files are still absent and deferred to the final step.

## Acceptance Criteria

- Quality scripts exist and pass.
- Publish-oriented packages have build config and package metadata.
- Final README assets referenced by docs exist in the reconstructed tree.
- README explains the complete runtime project clearly.
- New operation lifecycle is documented explicitly.
- Published package names and deployed remote MCP resource names are finalized for the Skill step.
- Skill package files are not introduced yet.
- No automated test workflow is introduced.

## Non-Goals

- Do not reconstruct `specs/`, `AGENTS.md`, or `CLAUDE.md` even though they exist on `main`.
- Do not add new operations.
- Do not add code generation.
- Do not add production hosting/deployment docs.
- Do not add auth beyond existing Telegram token handling.
- Do not add Skill docs until the final reconstruction step.
