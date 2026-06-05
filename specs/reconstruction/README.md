# SendKit Reconstruction Plan

## Goal

Reconstruct SendKit as a tutorial-friendly sequence that starts with a runnable CLI and grows into the final MCP-backed architecture.

This repository currently contains the finished MessageKit source, but the reconstruction tutorial intentionally teaches the project under the new SendKit name because `messagekit` is already taken. Treat every `sendkit` and `SendKit` reference in these specs as the desired tutorial name, not as a typo to correct back to MessageKit.

The sequence should preserve the "build once" philosophy: public names, commands, package locations, and tool names should be final when introduced.

## Tutorial Philosophy

Each step should either make a Telegram message send, make the existing working flow more useful, or expose the same working behavior through a new interface.

```text
Runnable first.
Final names from day one.
No empty architecture.
No temporary public commands.
Extract only after there is a concrete reason.
```

## Step Sequence

Use [Reconstruction Implementation Prompt](./IMPLEMENTATION_PROMPT.md) as the standing instruction when asking an agent to implement any step.

Use [Reconstruction File Map](./FILE_MAP.md) to ensure every tracked non-excluded file from `main` is introduced or updated in a specific reconstruction step.

1. [Minimal CLI](./01-minimal-cli.md)
2. [Extract Shared Core](./02-extract-shared-core.md)
3. [Local MCP Adapter](./03-local-mcp-adapter.md)
4. [Remote MCP Adapter](./04-remote-mcp-adapter.md)
5. [CLI Config And JSON Output](./05-cli-config-and-json.md)
6. [Polish And Publish](./06-polish-and-publish.md)
7. [SendKit Skill](./07-sendkit-skill.md)

## Git Workspace Model

Each step should be implemented in its own git workspace, such as a branch or worktree, built directly on top of the previous step.

When using git worktrees, create them in the encapsulating folder of this codebase, not inside this repository. From the `messagekit` repository root, the worktree paths should be siblings under `../reconstruction/` while the branch names remain `reconstruction/...`.

```text
../reconstruction/01-minimal-cli          -> branch reconstruction/01-minimal-cli, starts from a completely empty repository
../reconstruction/02-extract-shared-core  -> branch reconstruction/02-extract-shared-core, starts from step 1
../reconstruction/03-local-mcp-adapter    -> branch reconstruction/03-local-mcp-adapter, starts from step 2
../reconstruction/04-remote-mcp-adapter   -> branch reconstruction/04-remote-mcp-adapter, starts from step 3
../reconstruction/05-cli-config-and-json  -> branch reconstruction/05-cli-config-and-json, starts from step 4
../reconstruction/06-polish-and-publish   -> branch reconstruction/06-polish-and-publish, starts from step 5 and prepares publish/deploy names
../reconstruction/07-sendkit-skill        -> branch reconstruction/07-sendkit-skill, starts from step 6 and adds final Skill guidance
```

The sequence should reconstruct the finished project behavior from scratch. Step 1 should not be based on the current `main` tree with files deleted; it should begin from an empty repo state and add only the files required by that step.

## Files Not To Reconstruct

Do not include these files or folders in any reconstructed tutorial step:

```text
specs/
AGENTS.md
CLAUDE.md
```

These files are planning and agent guidance artifacts for maintaining the source repository. They should not appear in the tutorial reconstruction branches unless a future spec explicitly changes that decision.

## Final Architecture

```text
packages/core      -> shared schemas and operations
packages/cli       -> command-line adapter backed by core
packages/local-mcp -> local MCP stdio server adapter backed by core
apps/remote-mcp    -> remote MCP HTTP adapter backed by core
packages/skills/sendkit -> agent-facing instructions and fallback guidance
```

## Public Names To Preserve

```text
core function: sendTelegramMessage
CLI command:   sendkit telegram <chatId> <message>
MCP tool:      telegram
Skill usage:   telegram
```

Development commands should be final when introduced:

```bash
bun run dev:cli
bun run dev:local-mcp
bun run dev:remote-mcp
bun run format
bun run lint
bun run typecheck
bun run release:check
```

## Reconstruction Rules

- Build each step in its own git workspace on top of the previous step.
- If using git worktrees, create them outside this repository in the parent folder, under `../reconstruction/<step-name>`.
- Start step 1 from a completely empty repository.
- Move step 6 toward the publishable/deployable runtime result, excluding files that are intentionally deferred.
- Add the Skill in step 7 after published package names and deployed resource names are known.
- Every tracked non-excluded file on `main` must be assigned to a step in `FILE_MAP.md` and mentioned in that step's file changes.
- Do not create packages before they are used by a runnable step.
- Do not introduce temporary public commands such as `bun run dev` if the final command is `bun run dev:cli`.
- Do not introduce temporary package names or folder names that must be renamed later.
- Do not add root scripts until there is something real for them to run.
- Do not add publishing, release, lint, or formatting mechanics before the project has working product behavior.
- Do not add Skill instructions before publish/deploy names are available.
- Do not duplicate business logic after `packages/core` exists.
- Keep operation registration explicit across core, CLI, MCP adapters, Skill docs, and README.
- Do not reconstruct `specs/`, `AGENTS.md`, or `CLAUDE.md`.

## Source-Truth Parity

The finished `main` branch is the source of truth for every file, public API, command, package name, implementation detail, and behavior that is already in scope for a reconstruction step.

When implementing a step:

- Inspect the corresponding files on `main` before writing or changing in-scope files.
- Prefer the `main` implementation for anything that has already been introduced by the current step.
- If an in-scope file can match `main` exactly without introducing later-step behavior, it should match `main` exactly.
- If a `main` file contains behavior from later steps, include only the current-step subset and keep the code as close to `main` as the scope allows.
- Do not creatively reimplement in-scope behavior from the written spec when `main` already contains the final version.
- Any intentional mismatch from `main` must be explained by deferred scope and listed in the step spec under `Expected Differences From Main`.
- Any mismatch not listed in `Expected Differences From Main` should be treated as a bug in the implementation or a missing spec note.

## Verification Strategy

Early steps use manual behavior checks because the tutorial intentionally avoids automated tests.

After the polish step introduces quality scripts, every implementation should run:

```bash
bun run format
bun run lint
bun run typecheck
```

Publish-oriented steps should also run:

```bash
bun run release:check
```
