# SendKit Skill Spec

## Goal

Add agent-facing Skill instructions that explain when to use the MCP tool and when to fall back to the published CLI.

This step is last so the Skill can reference the final published package names, CLI command, and deployed remote MCP resource names instead of placeholders from earlier chapters.

## Background

The Skill is documentation and guidance only. It should help agents choose the right interface without duplicating business logic or pretending core is user-facing.

```text
packages/skills/sendkit owns:
- agent-facing usage guidance
- MCP-first recommendation
- published CLI fallback instructions
- local and remote MCP setup notes
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

Build this step in its own git workspace, such as branch `reconstruction/07-sendkit-skill` checked out at `../reconstruction/07-sendkit-skill`.

Start from the completed `../reconstruction/06-polish-and-publish` workspace. This step should add the Skill after the CLI packages are publish-ready and the remote MCP resource names are known.

Do not reconstruct:

- `specs/`
- `AGENTS.md`
- `CLAUDE.md`

## Scope

In scope:

- Create the SendKit Skill package location.
- Document MCP `telegram` as the preferred path when available.
- Document local and remote MCP usage using final configured names.
- Document CLI fallback commands using the final published `sendkit` command.
- Explain that core is an implementation detail.
- Explain that MCP tool input should include only `chatId` and `message`.

Out of scope:

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
sendkit telegram "<chat-id>" "<message>" --json
```
````

## Implementation Notes

- Keep the Skill product-generic while documenting `telegram` as the available tutorial capability.
- Do not instruct agents to call `@codewithantonio/sendkit-core` directly.
- Do not include the bot token in MCP tool input examples.
- Keep fallback CLI examples aligned with the final published command, not `bun run dev:cli`.
- Include final remote MCP resource names or URLs only after they are known from the deploy/publish step.

## Expected Differences From Main

This step introduces the Skill after the rest of the project is publish-ready and deployed, so it should use final public names instead of development placeholders.

Expected differences:

- `specs/`, `AGENTS.md`, and `CLAUDE.md` remain excluded even though they exist on `main`.
- Any tutorial-only `TEACHER.md` content may differ from `main` when needed to teach the reconstruction chapter.

Expected parity:

- `packages/skills/sendkit/SKILL.md` should match the final Skill's in-scope guidance from `main`: prefer MCP, document local and remote MCP usage, fall back to CLI, and keep core as an implementation detail.
- Skill examples should use the final public `telegram` capability name.
- Skill CLI examples should use the final published `sendkit` command and package names.
- Skill remote MCP examples should use final deployed resource names or URLs from the previous step.
- MCP examples should include only `chatId` and `message`, not `botToken`.

## File Changes

```text
packages/skills/sendkit/package.json -> Skill package metadata
packages/skills/sendkit/SKILL.md     -> agent-facing instructions with final published/deployed names
package.json                         -> workspace entry if needed
bun.lock                             -> dependency lockfile updates if workspace metadata changes
TEACHER.md                           -> update teacher-facing manual verification guide for this chapter
```

## Documentation Updates

The Skill itself is the documentation update for this step. Update root README or package README references only if the final Skill installation or usage names were intentionally deferred from the polish step.

`TEACHER.md` must document only this step's new teaching and verification needs. Include:

- Why the Skill is introduced after publish/deploy: it should describe final agent behavior with proper package and resource names, not future placeholders.
- How to explain the Skill's role: agent-facing instructions that prefer MCP and fall back to CLI, not another implementation layer.
- How to verify the Skill points agents to the MCP `telegram` tool first.
- How to verify local and remote MCP references match the final configured names.
- How to verify CLI fallback examples match the published `sendkit` command.
- Explain why the Skill must not include `botToken` in MCP tool input examples: credentials come from the MCP client/server environment, not agent-provided tool arguments.
- Explain why the Skill should not tell agents to import or call `@codewithantonio/sendkit-core` directly: core is an implementation detail behind CLI and MCP interfaces.
- Explain that a Skill can improve agent behavior without adding runtime code because it changes instructions, not product capabilities.

## Implementation Steps

1. Create `packages/skills/sendkit`.
2. Add Skill package metadata.
3. Write MCP-first usage guidance for local and remote MCP.
4. Add CLI fallback guidance using the published command.
5. Add credential handling notes.
6. Verify examples match final commands, package names, resource names, and tool names.

## Verification

Manual verification should cover:

- Skill references MCP `telegram` as preferred.
- Skill references local and remote MCP configuration using final names.
- Skill references published CLI fallback commands that exist.
- Skill does not tell agents to call core directly.
- Skill does not put `botToken` in MCP input examples.

## Acceptance Criteria

- Skill exists at `packages/skills/sendkit/SKILL.md`.
- Skill accurately describes local MCP, remote MCP, and CLI usage.
- Skill does not duplicate business logic.
- No temporary Skill folder is introduced.

## Non-Goals

- Do not copy files from the finished `main` branch that are not required for this step.
- Do not add new runtime code.
- Do not create operation registry docs.
