# MessageKit CLI

MessageKit CLI is the human-facing command-line interface for the MessageKit tutorial project.

It runs on Node.js and exposes the `messagekit` binary for manual usage, scripting, and debugging. MCP remains the primary agent-facing interface in the tutorial.

## Installation

```bash
npm install -g @codewithantonio/messagekit
```

## Configuration

Configure the Telegram bot token once:

```bash
messagekit init --telegram-bot-token "<bot-token>"
```

The CLI stores local configuration at `~/.config/messagekit/config.json`.

## Send A Telegram Message

```bash
messagekit telegram "<chat-id>" "Hello from MessageKit"
```

For scriptable output, pass `--json`:

```bash
messagekit telegram "<chat-id>" "Hello from MessageKit" --json
```

The CLI uses `@codewithantonio/messagekit-core` internally and does not duplicate Telegram API logic.
