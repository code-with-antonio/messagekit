# CLI Local Link Spec

## Goal

Allow the `@codewithantonio/messagekit` package to be invoked from anywhere on the machine as `messagekit` before the package is published.

This is the first distribution step for the CLI: local global invocation through Bun's package linking.

## Current Package Requirement

`packages/cli/package.json` must expose the CLI binary:

```json
{
  "bin": {
    "messagekit": "./src/index.ts"
  }
}
```

`packages/cli/src/index.ts` must keep the Bun shebang:

```ts
#!/usr/bin/env bun
```

This lets Bun create a global `messagekit` command that runs the TypeScript entrypoint directly.

## Link Workflow

From the CLI package directory, register the package globally:

```bash
bun link
```

From any other directory on the machine, verify the linked binary:

```bash
messagekit --help
```

Configure the CLI:

```bash
messagekit init --telegram-bot-token "<bot-token>"
```

Send a Telegram message:

```bash
messagekit telegram "<chat-id>" "Hello from MessageKit"
```

Send a Telegram message with JSON output:

```bash
messagekit telegram "<chat-id>" "Hello from MessageKit" --json
```

## Acceptance Criteria

- Running `bun link` inside `packages/cli` creates a global `messagekit` command.
- Running `messagekit --help` from outside the repository prints the MessageKit CLI help output.
- Running `messagekit init --telegram-bot-token "<bot-token>"` writes local CLI config to `~/.config/messagekit/config.json`.
- Running `messagekit telegram "<chat-id>" "Hello from MessageKit"` uses the shared `@codewithantonio/messagekit-core` Telegram operation.
- The CLI package does not duplicate Telegram business logic for linking or distribution.

## Unlink Workflow

To remove the local global command, run this from `packages/cli`:

```bash
bun unlink
```
