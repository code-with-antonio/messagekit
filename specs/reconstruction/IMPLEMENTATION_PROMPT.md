# Reconstruction Implementation Prompt

Use this document as the standing instruction for implementing any SendKit reconstruction step.

## How To Use

Tag this file together with the step spec you want implemented.

Example for step 1:

```text
Implement @specs/reconstruction/01-minimal-cli.md using @specs/reconstruction/IMPLEMENTATION_PROMPT.md.
```

Example for a later step:

```text
Implement @specs/reconstruction/03-local-mcp-adapter.md using @specs/reconstruction/IMPLEMENTATION_PROMPT.md.
```

Also consult `@specs/reconstruction/FILE_MAP.md` before implementing. The file map is mandatory and assigns every tracked non-excluded `main` file to a reconstruction step.

## Standing Instructions

Implement the requested reconstruction step exactly as a tutorial chapter source-of-truth branch or worktree.

The reconstruction tutorial intentionally renames the finished MessageKit project to SendKit. The source repository may still contain MessageKit package names, paths, or docs, but reconstructed tutorial branches should use SendKit public naming wherever the specs say `sendkit` or `SendKit`. Do not "fix" these references back to MessageKit.

Each reconstruction step must be built in its own git workspace, such as a branch or worktree, and each step must build directly on top of the previous completed step.

When using git worktrees, create them in the encapsulating folder of this codebase, not inside this repository. From the `messagekit` repository root, the worktree paths should be siblings under `../reconstruction/` while the branch names remain `reconstruction/...`.

The expected stack is:

```text
../reconstruction/01-minimal-cli          -> branch reconstruction/01-minimal-cli, starts from a completely empty repository
../reconstruction/02-extract-shared-core  -> branch reconstruction/02-extract-shared-core, starts from step 1
../reconstruction/03-local-mcp-adapter    -> branch reconstruction/03-local-mcp-adapter, starts from step 2
../reconstruction/04-remote-mcp-adapter   -> branch reconstruction/04-remote-mcp-adapter, starts from step 3
../reconstruction/05-cli-config-and-json  -> branch reconstruction/05-cli-config-and-json, starts from step 4
../reconstruction/06-polish-and-publish   -> branch reconstruction/06-polish-and-publish, starts from step 5 and prepares publish/deploy names
../reconstruction/07-sendkit-skill        -> branch reconstruction/07-sendkit-skill, starts from step 6 and adds final Skill guidance
```

Step 1 must start from a completely empty repository state. Do not copy the finished `main` tree and delete files from it.

Later steps must start from the previous reconstruction step and add only the delta required by the requested spec.

## Files Not To Reconstruct

Do not include these files or folders in any reconstructed tutorial step:

```text
specs/
AGENTS.md
CLAUDE.md
```

These files are planning and agent guidance artifacts for the source repository. They are not part of the tutorial reconstruction output.

## Build Once Rules

- Use final public names when introduced.
- Use final package locations when introduced.
- Use final script names when introduced.
- Do not introduce temporary public commands.
- Do not create empty packages for future chapters.
- Do not add root scripts until they run something real.
- Do not add formatting, linting, typechecking, release, or publishing mechanics before the step that asks for them.
- Do not add Skill instructions before the final step that has published package names and deployed resource names.
- Do not duplicate business logic after `packages/core` exists.
- Keep operation registration explicit across core, CLI, MCP adapters, Skill docs, and README.

## Source-Truth Parity

The finished `main` branch is the source of truth for anything that is already in scope for the requested reconstruction step.

Before implementing, inspect the matching files on `main` for all files assigned to the step in `FILE_MAP.md`. For each in-scope file or behavior:

- Match `main` exactly when the whole file or behavior is already in scope.
- Match `main` as closely as possible when the `main` file also contains later-step behavior.
- Omit only behavior that is explicitly out of scope for the current step.
- Do not invent a new implementation when `main` already has the final implementation for the in-scope behavior.
- Treat the step spec's `Expected Differences From Main` section as the complete list of acceptable mismatches.
- If an implementation needs another mismatch from `main`, update the step spec or stop and ask before proceeding.

## Implementation Process

1. Read the requested step spec fully.
2. Read `@specs/reconstruction/FILE_MAP.md` and identify every file assigned to the requested step.
3. Inspect the corresponding `main` branch files for every in-scope file and behavior.
4. Read the requested step spec's `Expected Differences From Main` section and use it as the allowed mismatch list.
5. Identify the correct base workspace from the reconstruction stack.
6. Create or use the requested reconstruction branch/worktree.
7. Implement only the target shape and scope from the requested step spec, including all files assigned to the step in `FILE_MAP.md`.
8. Add or update the root `TEACHER.md` for the reconstruction workspace with exact teacher verification commands, required setup values introduced by this step, expected results, and student-facing explanation notes for the requested step.
9. Avoid reconstructing excluded files.
10. Run the verification commands listed in the requested step spec.
11. Report exactly what matched `main`, what intentionally differs from `main`, what was verified, and any known gaps.

## Verification Expectations

Use the verification section from the requested step spec as the source of truth.

## Teacher Guide Requirements

Every reconstruction step must include a root `TEACHER.md`. This file is not optional and must be useful for teaching that chapter live without relying on unstated knowledge about the new material in that chapter.

`TEACHER.md` is per-step instruction. Do not repeat all setup or explanation notes from previous reconstruction steps unless the requested step changes that behavior or the previous setup is required in a new way.

Each `TEACHER.md` must include:

- Exact commands to run from the reconstruction workspace root.
- Required setup values introduced or changed by the step, including where to obtain them.
- Expected successful output or observable behavior.
- Negative verification commands and expected failures.
- Student-facing explanation notes for concepts introduced by the step, including real failure modes that may appear during live demonstration.

Do not invent a `bun test` workflow. SendKit reconstruction uses manual verification and, once introduced, the quality scripts:

```bash
bun run format
bun run lint
bun run typecheck
```

Publish-oriented reconstruction steps may also require:

```bash
bun run release:check
```

## Completion Criteria

A reconstruction step is complete when:

- It is implemented in the correct reconstruction workspace.
- It builds on the correct previous step.
- It includes only files in scope for that step.
- It includes every file assigned to that step in `FILE_MAP.md`.
- It includes a root `TEACHER.md` with step-specific manual verification guidance and student-facing explanation notes.
- It excludes `specs/`, `AGENTS.md`, and `CLAUDE.md`.
- Its public commands and package locations match the spec.
- Its verification commands have been run or any blockers are clearly documented.
