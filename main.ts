
// If you see errors in VS Code, install the Obsidian API types with:
// npm install obsidian
import { Plugin, TFile, normalizePath, PluginSettingTab, App, Setting, TextComponent, ToggleComponent, ExtraButtonComponent, Notice } from "obsidian";

interface MoveRule {
	property: string;
	value: string;
	folder: string;
}

interface AutoMoveSettings {
	rules: MoveRule[];
	showMoveToast: boolean;
	showDebugToast: boolean;
}

const DEFAULT_SETTINGS: AutoMoveSettings = {
	rules: [
		// Example: { property: "domain", value: "Health", folder: "Health" }
	],
	showMoveToast: true,
	showDebugToast: false
};

export default class AutoMoveOnPropertyPlugin extends Plugin {
	settings: AutoMoveSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new AutoMoveSettingTab(this.app, this));

		this.registerEvent(
			this.app.vault.on("modify", async (file: TFile) => {
				if (!(file instanceof TFile) || file.extension !== "md") return;
				const path = file.path;
				if (path.includes("/")) return; // Only act on root files

				const content = await this.app.vault.read(file);
				const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
				if (!match) return;
				const yaml = match[1];

				for (const rule of this.settings.rules) {
					const singleLineMatch = yaml.match(new RegExp(`^${rule.property}:[ \t]*["']?([^"'\n]+)["']?`, "m"));
					let matched = false;
					if (singleLineMatch && singleLineMatch[1].trim() === rule.value) {
						matched = true;
					} else {
						// More robust list property match supporting CRLF and hyphenated keys
						const listRegex = new RegExp(`^${rule.property}:\\s*\r?\n([\\s\\S]*?)(?=^[\\w-]+:\\s*|^---|^$)`, "m");
						const listMatch = yaml.match(listRegex);
						if (listMatch) {
							const items = listMatch[1]
								.split(/\r?\n/)
								.map((line: string) => line.replace(/^[ \t]*-[ \t]*/, '').trim())
								.filter((item: string) => item.length > 0);
							if (items.includes(rule.value)) {
								matched = true;
							}
						}
					}
					if (matched) {
						const newFolder = normalizePath(rule.folder);
						const newPath = `${newFolder}/${file.name}`;
						if (path === newPath) return;
						await this.app.vault.createFolder(newFolder).catch(() => {});
						await this.app.fileManager.renameFile(file, newPath);
						if (this.settings.showMoveToast) {
							new Notice(`Moved: ${file.name} → ${newFolder}`);
						}
						return;
					}
				}
			})
		);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

class AutoMoveSettingTab extends PluginSettingTab {
	plugin: AutoMoveOnPropertyPlugin;

	constructor(app: App, plugin: AutoMoveOnPropertyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Auto Move On Property Settings" });

		new Setting(containerEl)
			.setName("Show move notifications")
			.setDesc("Display a toast notification when a file is moved")
			.addToggle((toggle: ToggleComponent) =>
				toggle.setValue(this.plugin.settings.showMoveToast).onChange(async (value: boolean) => {
					this.plugin.settings.showMoveToast = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Show debug notifications")
			.setDesc("Display debug information toasts (for troubleshooting)")
			.addToggle((toggle: ToggleComponent) =>
				toggle.setValue(this.plugin.settings.showDebugToast).onChange(async (value: boolean) => {
					this.plugin.settings.showDebugToast = value;
					await this.plugin.saveSettings();
				})
			);

		this.plugin.settings.rules.forEach((rule: MoveRule, idx: number) => {
			const setting = new Setting(containerEl)
				.setName(`Rule ${idx + 1}`)
				.addText((text: TextComponent) =>
					text
						.setPlaceholder("Property")
						.setValue(rule.property)
						.onChange(async (value: string) => {
							rule.property = value;
							await this.plugin.saveSettings();
						})
				)
				.addText((text: TextComponent) =>
					text
						.setPlaceholder("Value")
						.setValue(rule.value)
						.onChange(async (value: string) => {
							rule.value = value;
							await this.plugin.saveSettings();
						})
				)
				.addText((text: TextComponent) =>
					text
						.setPlaceholder("Folder")
						.setValue(rule.folder)
						.onChange(async (value: string) => {
							rule.folder = value;
							await this.plugin.saveSettings();
						})
				)
				.addExtraButton((btn: ExtraButtonComponent) =>
					btn
						.setIcon("cross")
						.setTooltip("Delete rule")
						.onClick(async () => {
							this.plugin.settings.rules.splice(idx, 1);
							await this.plugin.saveSettings();
							this.display();
						})
				);
		});

		new Setting(containerEl)
			.setName("Add Rule")
			.addButton((btn: ExtraButtonComponent) =>
				btn
					.setButtonText("Add")
					.onClick(async () => {
						this.plugin.settings.rules.push({ property: "", value: "", folder: "" });
						await this.plugin.saveSettings();
						this.display();
					})
			);
	}
}
