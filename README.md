
# Obsidian Auto Move On Property Plugin

Automatically moves notes from your vault root or chosen folders to other folders based on YAML property values. Configure rules and watched folders in the plugin settings UI.

## What it does
- Watches vault root (toggle) and any folders you specify
- Checks YAML frontmatter for property/value matches
- Moves notes to folders you set in your rules

## Usage
- Set which folders to watch and add your move rules in the settings UI
- When a note matches a rule, it moves automatically

## UI Options

- **Watched folders:** Comma-separated list of folders to monitor for changes.
- **Always watch vault root:** Toggle to include notes in the vault root.
- **Move rules:** Set property, value, and destination folder for automatic moves.
- **Show move notifications:** Enable to display a toast when a file is moved.
- **Show debug notifications:** Enable for detailed troubleshooting toasts.

## Example




| Property   | Value     | Folder      |
|------------|-----------|-------------|
| status     | complete  | archive     |

A note with:
```
---
status: complete
---
```
will be moved to the `archive/` folder if placed in a watched folder.

---
MIT License
