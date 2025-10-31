# Obsidian Auto Move On Property Plugin

Automatically move notes from your vault root to folders based on YAML property values. No scripting or manual triggers required—just set your rules in the plugin settings UI!

## Features
- Monitors your vault root for new or changed notes
- Reads YAML frontmatter for property values
- Moves notes to folders based on your custom rules
- Easy-to-use settings UI for adding/editing property→folder associations

## Installation
1. Download or copy the plugin folder (`auto-move-on-property`) into your vault’s `.obsidian/plugins/` directory.
2. Make sure the folder contains at least:
   - `main.js`
   - `manifest.json`
3. Enable the plugin in Obsidian under Settings → Community plugins.

## Usage
1. Open Settings → Auto Move On Property.
2. Add rules: specify the property name, value, and destination folder.
3. Place a note in your vault root with the matching YAML property.
4. The note will be moved automatically to the correct folder.

## Example Rule
| Property | Value   | Folder   |
|----------|---------|----------|
| domain   | Health  | Health   |

A note with:
```
---
domain: Health
---
```
will be moved to the `Health/` folder.

## License
MIT

---
Plugin by destiny911 & GitHub Copilot.
