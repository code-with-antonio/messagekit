# SendKit Skill Spec

## Goal

Add agent-facing Skill instructions that explain when to use the MCP tool and when to fall back to the CLI.

This step documents real interfaces that already exist instead of creating a Skill around future functionality.

## Background

The Skill is documentation and guidance only. It should help agents choose the right interface without duplicating business logic or pretending core is user-facing.

```text
packages/skills/sendkit owns:
- agent-facing usage guidance
- MCP-first recommendation
- CLI fallback instructions
- warnings about credential handling

packages/skills/sendkit must not own:
- Telegram API implementation
- CLI command implementation
- MCP tool implementation
- package publishing behavior
```

## Decision

Create the Skill directly in its final location:

```text
packages/skills/sendkit/SKILL.md
```

Do not create a temporary `packages/skill` folder.

## Reconstruction Workspace

Build this step in its own git workspace, such as `reconstruction/05-sendkit-skill`.

Start from the completed `reconstruction/04-local-mcp-adapter` workspace. This step should add the Skill after the real CLI and local MCP interfaces exist.

Do not reconstruct:

- `specs/`
- `AGENTS.md`
- `CLAUDE.md`

## Scope

In scope:

- Create the SendKit Skill package location.
- Document MCP `telegram` as the preferred path when available.
- Document CLI fallback commands.
- Explain that core is an implementation detail.
- Explain that MCP tool input should include only `chatId` and `message`.

Out of scope:

- Remote MCP instructions that do not exist yet.
- Additional operations.
- Skill installation automation.
- Business logic.
- `specs/`.
- `AGENTS.md` and `CLAUDE.md`.

## Target Shape

```text
packages/skills/sendkit/package.json
packages/skills/sendkit/SKILL.md
```

Skill guidance should include:

````md
Prefer the MCP `telegram` tool when it is available.

Use the CLI fallback when MCP is unavailable:

```bash
bun run dev:cli telegram "<chat-id>" "<message>"
```
````

## Implementation Notes

- Keep the Skill product-generic while documenting `telegram` as the available tutorial capability.
- Do not instruct agents to call `@codewithantonio/sendkit-core` directly.
- Do not include the bot token in MCP tool input examples.
- Keep fallback CLI examples aligned with the current development commands.

## File Changes

```text
packages/skills/sendkit/package.json -> Skill package metadata
packages/skills/sendkit/SKILL.md     -> agent-facing instructions
package.json                            -> workspace entry if needed
bun.lock                                -> dependency lockfile updates if workspace metadata changes
TEACHER.md                              -> update teacher-facing manual verification guide for this chapter
```

## Documentation Updates

The Skill itself is the documentation update for this step. Do not update the root README until the polish step.

`TEACHER.md` must document only this step's new teaching and verification needs. Include:

- Why the Skill is introduced after local MCP exists: it should describe real agent behavior, not future placeholders.
- How to explain the Skill's role: agent-facing instructions that prefer MCP and fall back to CLI, not another implementation layer.
- How to verify the Skill points agents to the MCP `telegram` tool first.
- How to verify CLI fallback examples match commands that already exist.
- Explain why the Skill must not include `botToken` in MCP tool input examples: credentials come from the MCP client/server environment, not agent-provided tool arguments.
- Explain why the Skill should not tell agents to import or call `@codewithantonio/sendkit-core` directly: core is an implementation detail behind CLI and MCP interfaces.
- Explain that a Skill can improve agent behavior without adding runtime code because it changes instructions, not product capabilities.

## Implementation Steps

1. Create `packages/skills/sendkit`.
2. Add Skill package metadata.
3. Write MCP-first usage guidance.
4. Add CLI fallback guidance.
5. Add credential handling notes.
6. Verify examples match existing commands and tool names.

## Verification

Manual verification should cover:

- Skill references MCP `telegram` as preferred.
- Skill references CLI fallback commands that exist.
- Skill does not tell agents to call core directly.
- Skill does not put `botToken` in MCP input examples.

## Acceptance Criteria

- Skill exists at `packages/skills/sendkit/SKILL.md`.
- Skill accurately describes local MCP and CLI usage.
- Skill does not duplicate business logic.
- No temporary Skill folder is introduced.

## Non-Goals

- Do not copy files from the finished `main` branch that are not required for this step.
- Do not document remote MCP until it exists.
- Do not add new runtime code.
- Do not create operation registry docs.
