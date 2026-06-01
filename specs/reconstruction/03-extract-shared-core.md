# Extract Shared Core Spec

## Goal

Move Telegram business logic out of the CLI and into `packages/core` without changing CLI behavior.

This step introduces the shared implementation boundary only after there is a working CLI that benefits from extraction.

## Background

The CLI currently owns Telegram behavior. That is acceptable while the CLI is the only interface, but MCP will need the same operation next.

```text
packages/core owns:
- Zod input schemas
- Zod output schemas
- operation functions such as sendTelegramMessage
- exported types derived from schemas

packages/core must not own:
- CLI argument parsing
- local CLI config reads
- MCP SDK imports
- terminal output
- process exits
```

## Decision

Create the final core package and move reusable Telegram behavior there:

```text
packages/core/src/schemas.ts
packages/core/src/operations.ts
packages/core/src/index.ts
```

The CLI should keep the same public commands and call `sendTelegramMessage` from core.

## Reconstruction Workspace

Build this step in its own git workspace, such as `reconstruction/03-extract-shared-core`.

Start from the completed `reconstruction/02-cli-config-and-json` workspace. This step should preserve the existing CLI behavior while adding the final core package boundary.

Do not reconstruct:

- `specs/`
- `AGENTS.md`
- `CLAUDE.md`

## Scope

In scope:

- Create `packages/core` in its final location.
- Update root workspace and TypeScript configuration as needed for multiple packages.
- Add Telegram input and output schemas.
- Add `sendTelegramMessage`.
- Export schemas, types, and operation from core.
- Update CLI to call core.
- Preserve CLI config and output behavior.

Out of scope:

- MCP adapters.
- Remote MCP.
- Skill documentation.
- Shared operation registry.
- `specs/`.
- `AGENTS.md` and `CLAUDE.md`.
- Publishing build setup.

## Target Shape

Core operation:

```ts
await sendTelegramMessage({
  botToken,
  chatId,
  message,
});
```

Core output:

```json
{
  "ok": true,
  "chatId": "123456789",
  "messageId": 42
}
```

Dependency direction:

```text
packages/cli -> packages/core
```

## Implementation Notes

- Core should receive `botToken` as an explicit function input.
- Core should not read `process.env` or local config.
- CLI should continue to own config reads and terminal output.
- Keep the operation name final: `sendTelegramMessage`.
- Keep schemas reusable for later MCP input definitions.

## File Changes

```text
packages/core/package.json      -> core package metadata and dependencies
packages/core/src/schemas.ts    -> Telegram input/output schemas and types
packages/core/src/operations.ts -> sendTelegramMessage implementation
packages/core/src/index.ts      -> public exports
packages/cli/package.json       -> dependency on core
packages/cli/src/index.ts       -> call core instead of inline Telegram logic
tsconfig.json                   -> workspace TypeScript updates if needed for package imports
bun.lock                        -> dependency lockfile updates
TEACHER.md                      -> update teacher-facing manual verification guide for this chapter
```

## Documentation Updates

Update README notes only enough to explain the new boundary:

```text
packages/core owns reusable MessageKit operations. The CLI adapts those operations for human and script usage.
```

## Implementation Steps

1. Create `packages/core` with Zod dependency and TypeScript source files.
2. Move Telegram request validation and response shaping into core.
3. Export schemas, types, and `sendTelegramMessage` from core.
4. Update CLI to import and call core.
5. Verify all existing CLI commands still work.

## Verification

Run from the workspace root:

```bash
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit"
bun run dev:cli telegram "<chat-id>" "Hello from MessageKit" --json
```

Manual verification should cover:

- CLI behavior is unchanged after extraction.
- Core receives the bot token as data, not through environment or config reads.
- JSON output still matches the target output shape.

## Acceptance Criteria

- Telegram business logic lives in `packages/core`.
- CLI no longer duplicates Telegram API request logic.
- CLI still owns config, argument parsing, and output formatting.
- No MCP package is added in this step.

## Non-Goals

- Do not copy files from the finished `main` branch that are not required for this step.
- Do not introduce a dynamic operation registry.
- Do not add remote HTTP behavior.
- Do not add automated tests.
