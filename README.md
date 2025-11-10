# Obsidian Auto Move On Property

Automatically move notes from your vault root to folders based on YAML frontmatter property values. No scripting or manual triggers required — just configure your rules in the plugin settings UI. The plugin watches for new or changed notes and moves them when a rule matches.

## Features

- Monitors your vault root for new or changed notes
- Reads YAML frontmatter for property values
- Moves notes to folders based on your custom rules
- Easy-to-use settings UI for adding and editing property → folder associations
- Supports single-line values and list values in YAML

## Installation

1. Copy the plugin folder (`auto-move-on-property`) into your vault's `.obsidian/plugins/` directory.
2. Ensure the folder contains at least:
   - `main.js`
   - `manifest.json`
3. Enable the plugin in Obsidian under Settings → Community plugins.

## Usage

1. Open Settings → Auto Move On Property.
2. Add rules by specifying:
   - Property name (frontmatter key)
   - Expected value(s)
   - Destination folder
3. Place a note in your vault root with the matching YAML frontmatter.
4. The note will be moved automatically to the destination folder that matches the rule.

## Example rule

| Property | Value  | Folder |
|----------|--------|--------|
| domain   | Health | Health |

A note with the following frontmatter:

```yaml
---
domain: Health
---
```

will be moved to the `Health/` folder.

UI
![plugin UI screenshot](https://github.com/user-attachments/assets/ec7ba438-05ba-4671-99d1-1bc56bce9961)

## Change the monitored folder (not just root)

By default the plugin acts only on files in the vault root. To make it operate on another folder or on all folders, adjust or remove the root-only check in the code:

```js
// Example: change or remove this line to allow non-root files
if (path.includes("/")) return; // Only act on root files
```

Modify that condition to suit the folder scope you want the plugin to monitor. For example, to only ignore hidden folders you could add an exclusion instead of checking for any "/" in the path.

## Requirements

Tested with Obsidian 1.9.14 & Windows 11.

## Support

This plugin is provided as-is. Issues and feature requests will not be actively maintained.

## License

MIT

---

Plugin by destiny911 & GitHub Copilot.
