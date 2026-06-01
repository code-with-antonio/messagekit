# CLI Config And JSON Output Spec

## Goal

Turn the minimal CLI into the final human and script-friendly CLI interface.

This step keeps the same `dev:cli` and `telegram` command shape while adding persistent local configuration and machine-readable output.

## Background

The first CLI step proves that Telegram sending works. Requiring `TELEGRAM_BOT_TOKEN` on every command is acceptable for a spike, but poor for repeated human usage.

```text
packages/cli owns:
- CLI argument parsing
- local CLI config persistence
- readable output
- JSON output for scripts and agents

packages/cli must not own:
- reusable business logic once core exists
- MCP credential handling
- remote auth behavior
```

## Decision

Add the final CLI ergonomics before extracting core:

```bash
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from SendKit"
bun run dev:cli telegram "<chat-id>" "Hello from SendKit" --json
```

The Telegram API call can remain inline until the next step.

## Reconstruction Workspace

Build this step in its own git workspace, such as `reconstruction/02-cli-config-and-json`.

Start from the completed `reconstruction/01-minimal-cli` workspace. This step should contain all files from step 1 plus the config and JSON changes described here.

Do not reconstruct:

- `specs/`
- `AGENTS.md`
- `CLAUDE.md`

## Scope

In scope:

- Add `init --telegram-bot-token <token>`.
- Add `.env.example` documenting Telegram token setup for local development.
- Write config to `~/.config/sendkit/config.json`.
- Read the bot token from local config for `telegram`.
- Keep environment token support only if it is useful for the tutorial and does not complicate the final behavior.
- Add `--json` to `telegram`.
- Preserve readable output by default.

Out of scope:

- `packages/core` extraction.
- MCP adapters.
- Remote auth.
- `specs/`.
- `AGENTS.md` and `CLAUDE.md`.
- Publishing setup.

## Target Shape

Config path:

```text
~/.config/sendkit/config.json
```

Config shape:

```json
{
  "telegramBotToken": "<bot-token>"
}
```

Readable command:

```bash
bun run dev:cli telegram "<chat-id>" "Hello from SendKit"
```

JSON command:

```bash
bun run dev:cli telegram "<chat-id>" "Hello from SendKit" --json
```

JSON output:

```json
{
  "ok": true,
  "chatId": "123456789",
  "messageId": 42
}
```

## Implementation Notes

- Keep config reading and writing inline unless a small local helper materially reduces duplication.
- Create the config directory if it does not exist.
- Avoid logging secrets.
- `--json` output should print only JSON on success so it can be piped into scripts.
- Error output does not need a final structured error shape in this tutorial step.

## File Changes

```text
packages/cli/src/index.ts     -> init command, config read/write, --json output
.env.example                  -> example Telegram token environment variable for local development
.gitignore                    -> ignore local config if any repo-local config examples are introduced
package.json                  -> script or dependency updates if required
packages/cli/package.json     -> CLI dependency updates if required
bun.lock                      -> dependency lockfile updates
TEACHER.md                    -> update teacher-facing manual verification guide for this chapter
```

## Documentation Updates

Document only the CLI commands that now exist:

```bash
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from SendKit"
bun run dev:cli telegram "<chat-id>" "Hello from SendKit" --json
```

`TEACHER.md` must document only this step's new teaching and verification needs. Include:

- Why `init` moves the token from repeated environment variables into local CLI config for human convenience.
- The exact config path: `~/.config/sendkit/config.json`.
- That the config file contains a secret and should not be committed or shown in recordings.
- How to verify that `telegram` works without passing `TELEGRAM_BOT_TOKEN` inline after `init` succeeds.
- How to verify `--json` output is valid JSON and contains no extra human-readable lines.
- Explain that readable output is for humans, while `--json` is for scripts and agents that need stable machine-readable output.
- Explain that Telegram API logic remains inline for one more chapter because the CLI is still the only runtime interface. The extraction becomes meaningful when another adapter needs the same behavior.

## Implementation Steps

1. Add `.env.example` for Telegram token setup.
2. Add the `init` command to the CLI.
3. Write the Telegram token to `~/.config/sendkit/config.json`.
4. Update the `telegram` command to read from config.
5. Add `--json` output for successful sends.
6. Verify init, readable send, and JSON send.

## Verification

Run from the workspace root:

```bash
bun run dev:cli init --telegram-bot-token "<bot-token>"
bun run dev:cli telegram "<chat-id>" "Hello from SendKit"
bun run dev:cli telegram "<chat-id>" "Hello from SendKit" --json
```

Manual verification should cover:

- Config file is created in the expected location.
- Telegram message sends without passing `TELEGRAM_BOT_TOKEN` inline.
- `--json` prints valid JSON matching the target output shape.
- The default output remains readable for humans.

## Acceptance Criteria

- CLI supports `init` and persistent Telegram token config.
- CLI supports `telegram ... --json`.
- `.env.example` exists and documents the Telegram token variable used by early local development and MCP steps.
- The public command shape from step 1 remains valid.
- Telegram API logic is still allowed to live in CLI because no second adapter exists yet.

## Non-Goals

- Do not copy files from the finished `main` branch that are not required for this step.
- Do not add MCP behavior.
- Do not add a shared operation registry.
- Do not add package publishing setup.
