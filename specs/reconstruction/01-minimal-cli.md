# Minimal CLI Spec

## Goal

Create the smallest runnable SendKit CLI that can send a Telegram message.

This step should give the viewer an immediate payoff without setting up empty architecture or future-only tooling.

## Background

The tutorial should start with a real action, not a monorepo full of placeholders. The first runnable interface is the CLI because it is easy to execute, debug, and understand before MCP is introduced.

```text
packages/cli owns:
- CLI argument parsing
- initial inline Telegram API call
- human-readable terminal output

packages/cli must not own yet:
- shared package extraction
- MCP server behavior
- Skill documentation
- publishing setup
```

## Decision

Create `packages/cli` in its final location and expose the final development command from the beginning:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:cli telegram "<chat-id>" "Hello from SendKit"
```

The Telegram API call may be inline in the CLI during this step. That is the only temporary implementation detail. Public package location, command shape, and command name should already match the final tutorial.

## Reconstruction Workspace

Build this step in its own git workspace, such as branch `reconstruction/01-minimal-cli` checked out at `../reconstruction/01-minimal-cli`.

This is the first tutorial step and should start from a completely empty repository. Do not copy the current `main` tree and delete files from it. Add only the files needed to make the minimal CLI runnable.

Do not reconstruct:

- `specs/`
- `AGENTS.md`
- `CLAUDE.md`

## Scope

In scope:

- Create the minimal Bun workspace needed to run `dev:cli`.
- Create the root `tsconfig.json` needed by the TypeScript workspace from the first chapter.
- Create `packages/cli` with a Bun executable entrypoint.
- Add `@types/node` for Node globals and built-in module imports used by the CLI.
- Add `.env.example` documenting `TELEGRAM_BOT_TOKEN`.
- Add Commander-based `telegram <chatId> <message>` parsing.
- Read `TELEGRAM_BOT_TOKEN` from the environment.
- Send a message through the Telegram Bot API.
- Print a readable success result.

Out of scope:

- Local config files.
- `init` command.
- `--json` output.
- `packages/core`.
- MCP packages.
- Skill package.
- `specs/`.
- `AGENTS.md` and `CLAUDE.md`.
- Formatting, linting, typechecking, release, or publishing setup.

## Target Shape

```text
package.json
tsconfig.json
packages/cli/package.json
packages/cli/src/index.ts
```

Root script:

```json
{
  "scripts": {
    "dev:cli": "bun run packages/cli/src/index.ts"
  }
}
```

CLI usage:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:cli telegram "<chat-id>" "Hello from SendKit"
```

Readable output should include the target chat ID and Telegram message ID when available.

## Implementation Notes

- Keep the first CLI implementation direct and easy to read.
- Use the Telegram Bot API endpoint `https://api.telegram.org/bot<token>/sendMessage`.
- Validate that `TELEGRAM_BOT_TOKEN`, `chatId`, and `message` are present before making the request.
- Surface Telegram API failures clearly enough for tutorial debugging.
- Keep the shebang in the CLI entrypoint if the package will later expose a binary.

## Expected Differences From Main

This step intentionally differs from `main` because it is the smallest runnable CLI before shared core, MCP, Skill, remote MCP, and publishing are introduced.

Expected differences:

- `packages/core` does not exist yet, so Telegram request logic may live inline in `packages/cli/src/index.ts`.
- `packages/cli/src/index.ts` reads `TELEGRAM_BOT_TOKEN` from the environment and does not include `init`.
- `packages/cli/src/index.ts` does not include `--json` output.
- MCP adapters, Skill docs, remote MCP, package READMEs, build config, lint config, format config, and release scripts are not present yet.

Expected parity:

- Public CLI names should already use the final SendKit command shape: `bun run dev:cli telegram <chatId> <message>`.
- The Telegram API request should match the final operation behavior from `main` as closely as possible while remaining inline.
- The success output should include the same meaningful data as the final operation: target chat ID and Telegram message ID when available.

## File Changes

```text
package.json                  -> workspace metadata and dev:cli script
tsconfig.json                 -> root TypeScript configuration for the workspace
packages/cli/package.json     -> CLI package metadata, dependencies, and Node typings
packages/cli/src/index.ts     -> minimal telegram command
bun.lock                      -> dependency lockfile
.env.example                  -> example Telegram bot token environment variable
.gitignore                    -> standard local ignores for dependencies, build output, env files, and local artifacts
TEACHER.md                    -> teacher-facing manual verification guide for this chapter
```

## Documentation Updates

Create only minimal README content if needed to run this step. Avoid documenting future packages that do not exist yet.

`TEACHER.md` must document only this step's teaching and verification needs. Because this is the first step that requires Telegram credentials, include:

- How to create a Telegram bot token with `@BotFather`.
- How to obtain a `chat_id` with the Telegram `getUpdates` endpoint.
- That the bot must receive at least one message before `getUpdates` can return the chat ID.
- That group chat IDs are usually negative.
- That an existing webhook can make `getUpdates` return an empty `result`, and `deleteWebhook` can clear it.
- That Telegram bot tokens are credentials and must not be committed, recorded, or copied into example files.

Because this step introduces the first Bun workspace command, `TEACHER.md` must also explain:

- The canonical command is the root `dev:cli` script.
- Do not use `bun --filter` for interactive CLI verification. It can break interactive CLI argument forwarding and make Commander receive the wrong arguments or no arguments.
- Explain that the root `dev:cli` script is used because everything after `bun run dev:cli` is forwarded directly to the CLI entrypoint, which keeps the command predictable for students.
- Explain that `bun --filter` is reserved for non-interactive package maintenance commands later, such as package-specific build or typecheck scripts, not for the tutorial's interactive CLI command path.
- If students ask why not run the package directly with a filter, show that the lesson is the SendKit command shape, and the reliable development form is `bun run dev:cli ...` from the workspace root.
- Message text with spaces must be quoted so it stays one CLI argument.

## Implementation Steps

1. Create the root workspace manifest with only the scripts and workspace entries required for the CLI.
2. Create the root `tsconfig.json` so TypeScript configuration is explicit from the first chapter.
3. Create `packages/cli` and install Commander plus `@types/node`.
4. Implement `telegram <chatId> <message>` in `packages/cli/src/index.ts`.
5. Read `TELEGRAM_BOT_TOKEN` from the environment and call the Telegram Bot API.
6. Run the manual CLI verification command.

## Verification

Run from the workspace root:

```bash
TELEGRAM_BOT_TOKEN="<bot-token>" bun run dev:cli telegram "<chat-id>" "Hello from SendKit"
```

Manual verification should cover:

- A Telegram message is delivered.
- The command prints a readable success result.
- Missing `TELEGRAM_BOT_TOKEN` fails with a useful message.
- Missing command arguments fail through Commander or explicit validation.

## Acceptance Criteria

- `bun run dev:cli telegram "<chat-id>" "Hello from SendKit"` is the first runnable project command.
- The CLI sends a Telegram message using `TELEGRAM_BOT_TOKEN`.
- The root `tsconfig.json` exists and supports the TypeScript CLI package.
- No empty core, MCP, remote MCP, or Skill packages exist yet.
- No temporary public command names are introduced.

## Non-Goals

- Do not copy files from the finished `main` branch that are not required for this step.
- Do not add local config persistence.
- Do not extract core logic yet.
- Do not add MCP dependencies.
- Do not add release or quality tooling yet.
