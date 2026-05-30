# <Feature Or Change> Spec

## Goal

State the outcome in one or two direct sentences.

Explain why this change exists now. A good goal names the user-facing or maintainer-facing improvement, not just the files that will change.

## Background

Describe the current context that makes the change necessary.

Use this section to capture important existing behavior, prior decisions, constraints, or tutorial positioning that future implementers should preserve.

If the spec is about a package or adapter, include its role and ownership boundary:

```text
<package-or-area> owns:
- <responsibility>
- <responsibility>

<package-or-area> must not own:
- <responsibility that belongs elsewhere>
- <responsibility that belongs elsewhere>
```

## Current Issue

Explain what is wrong, missing, inconsistent, confusing, or incomplete today.

Be specific. Include short code, manifest, command, or documentation snippets when they make the issue easier to see.

```ts
// Current behavior or shape, if useful.
```

## Decision

State the chosen approach.

This should resolve ambiguity for the implementer. If there were multiple plausible approaches, mention the tradeoff briefly and explain why this one wins for the repository or tutorial.

## Scope

In scope:

- <specific change>
- <specific change>
- <specific behavior to preserve>

Out of scope:

- <nearby change that should not be included>
- <future enhancement>
- <thing that would make the spec too broad>

## Target Shape

Show the intended final structure, API, command, manifest, config, or documentation wording.

Prefer concrete examples over abstract descriptions.

```json
{
  "example": "target shape"
}
```

```bash
example-command --with-flags
```

## Implementation Notes

Document the important implementation details and constraints.

Keep this section focused on what matters for correctness and maintainability. Do not prescribe incidental edits unless they are necessary.

- Keep business logic in `packages/core` when the change affects reusable operations.
- Keep adapters explicit unless the spec intentionally introduces a shared abstraction.
- Preserve existing public names and behavior unless the spec explicitly changes them.
- Prefer the smallest change that satisfies the target shape.

## File Changes

List expected files when the implementation should touch known locations.

```text
path/to/file.ts        -> <expected change>
path/to/package.json  -> <expected change>
README.md             -> <expected documentation update>
```

If exact files are not known yet, describe the search criteria instead.

## Documentation Updates

Describe any README, Skill, AGENTS, package README, or spec updates required by the change.

Include exact wording when consistency matters.

```md
Example documentation text.
```

## Implementation Steps

1. <First concrete step.>
2. <Second concrete step.>
3. <Third concrete step.>
4. Run formatting, linting, and typechecking.

Keep the steps ordered so another agent or developer can execute the spec without rediscovering the workflow.

## Verification

Run from the workspace root unless noted otherwise:

```bash
bun run format
bun run lint
bun run typecheck
```

Add package-specific or behavior-specific checks below:

```bash
<package-or-feature-specific-command>
```

Manual verification should cover:

- <observable behavior>
- <important error case or edge case>
- <public command/API/config still works>

## Acceptance Criteria

- <specific final state that can be checked>
- <specific behavior that must work>
- <specific command that must pass>
- <specific documentation or package metadata requirement>
- No unrelated behavior, package names, public commands, or tutorial boundaries change.

## Non-Goals

- Do not <nearby but intentionally excluded change>.
- Do not <larger abstraction or future feature>.
- Do not <testing/deployment/publishing behavior unless this spec requires it>.

## Open Questions

- <Question that must be answered before implementation, or remove this section.>
