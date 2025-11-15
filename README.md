

# Obsidian Auto Move On Property Plugin

Automatically moves notes from your vault root or chosen folders to other folders based on YAML property values. Configure rules and watched folders in the plugin settings UI.

## What it does
- Watches vault root (toggle) and any folders you specify
- Checks YAML frontmatter for property/value matches
- Moves notes to folders you set in your rules

## Usage
- Set which folders to watch and add your move rules in the settings UI
- When a note matches a rule, it moves automatically

## Example
| Property   | Value   | Folder         |
|------------|---------|----------------|
| note-type  | recipe  | knowledge/recipe |

A note with:
```
---
note-type: recipe
---
```
will be moved to `knowledge/recipe/` if placed in a watched folder.

---
MIT License
