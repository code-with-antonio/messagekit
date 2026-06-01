# Reconstruction Implementation Prompt

Use this document as the standing instruction for implementing any MessageKit reconstruction step.

## How To Use

Tag this file together with the step spec you want implemented.

Example for step 1:

```text
Implement @specs/reconstruction/01-minimal-cli.md using @specs/reconstruction/IMPLEMENTATION_PROMPT.md.
```

Example for a later step:

```text
Implement @specs/reconstruction/04-local-mcp-adapter.md using @specs/reconstruction/IMPLEMENTATION_PROMPT.md.
```

Also consult `@specs/reconstruction/FILE_MAP.md` before implementing. The file map is mandatory and assigns every tracked non-excluded `main` file to a reconstruction step.

## Standing Instructions

Implement the requested reconstruction step exactly as a tutorial chapter source-of-truth branch or worktree.

Each reconstruction step must be built in its own git workspace, such as a branch or worktree, and each step must build directly on top of the previous completed step.

The expected stack is:

```text
reconstruction/01-minimal-cli          -> starts from a completely empty repository
reconstruction/02-cli-config-and-json  -> starts from step 1
reconstruction/03-extract-shared-core  -> starts from step 2
reconstruction/04-local-mcp-adapter    -> starts from step 3
reconstruction/05-messagekit-skill     -> starts from step 4
reconstruction/06-remote-mcp-adapter   -> starts from step 5
reconstruction/07-polish-and-publish   -> starts from step 6 and moves toward main
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
- Do not duplicate business logic after `packages/core` exists.
- Keep operation registration explicit across core, CLI, MCP adapters, Skill docs, and README.

## Implementation Process

1. Read the requested step spec fully.
2. Read `@specs/reconstruction/FILE_MAP.md` and identify every file assigned to the requested step.
3. Identify the correct base workspace from the reconstruction stack.
4. Create or use the requested reconstruction branch/worktree.
5. Implement only the target shape and scope from the requested step spec, including all files assigned to the step in `FILE_MAP.md`.
6. Add or update the root `TEACHER.md` for the reconstruction workspace with exact teacher verification commands, required setup values, expected results, and gotchas for the requested step.
7. Avoid reconstructing excluded files.
8. Run the verification commands listed in the requested step spec.
9. Report exactly what was implemented, what was verified, and any known gaps.

## Verification Expectations

Use the verification section from the requested step spec as the source of truth.

Do not invent a `bun test` workflow. MessageKit reconstruction uses manual verification and, once introduced, the quality scripts:

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
- It includes a root `TEACHER.md` with step-specific manual verification guidance.
- It excludes `specs/`, `AGENTS.md`, and `CLAUDE.md`.
- Its public commands and package locations match the spec.
- Its verification commands have been run or any blockers are clearly documented.
