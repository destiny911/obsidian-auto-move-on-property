
import { Plugin, TFile, normalizePath, PluginSettingTab, App, Setting } from "obsidian";

interface MoveRule {
	property: string;
	value: string;
	folder: string;
}

interface AutoMoveSettings {
	rules: MoveRule[];
}

const DEFAULT_SETTINGS: AutoMoveSettings = {
	rules: [
		// Example: { property: "domain", value: "Health", folder: "Health" }
	]
};

export default class AutoMoveOnPropertyPlugin extends Plugin {
	settings: AutoMoveSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new AutoMoveSettingTab(this.app, this));

		this.registerEvent(
			this.app.vault.on("modify", async (file) => {
				if (!(file instanceof TFile) || file.extension !== "md") return;
				const path = file.path;
				if (path.includes("/")) return; // Only act on root files

				const content = await this.app.vault.read(file);
				const match = content.match(/^---\n([\s\S]*?)\n---/);
				if (!match) return;
				const yaml = match[1];

				for (const rule of this.settings.rules) {
					const propMatch = yaml.match(
						new RegExp(`^${rule.property}:[ \t]*["']?([^"'\n]+)["']?`, "m")
					);
					if (propMatch && propMatch[1].trim() === rule.value) {
						const newFolder = normalizePath(rule.folder);
						const newPath = `${newFolder}/${file.name}`;
						if (path === newPath) return;
						await this.app.vault.createFolder(newFolder).catch(() => {});
						await this.app.fileManager.renameFile(file, newPath);
						return;
					}
				}
			})
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
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

		this.plugin.settings.rules.forEach((rule, idx) => {
			const setting = new Setting(containerEl)
				.setName(`Rule ${idx + 1}`)
				.addText(text => text
					.setPlaceholder("Property")
					.setValue(rule.property)
					.onChange(async (value) => {
						rule.property = value;
						await this.plugin.saveSettings();
						this.display();
					})
				)
				.addText(text => text
					.setPlaceholder("Value")
					.setValue(rule.value)
					.onChange(async (value) => {
						rule.value = value;
						await this.plugin.saveSettings();
						this.display();
					})
				)
				.addText(text => text
					.setPlaceholder("Folder")
					.setValue(rule.folder)
					.onChange(async (value) => {
						rule.folder = value;
						await this.plugin.saveSettings();
						this.display();
					})
				)
				.addExtraButton(btn => btn
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
			.addButton(btn => btn
				.setButtonText("Add")
				.onClick(async () => {
					this.plugin.settings.rules.push({ property: "", value: "", folder: "" });
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}
}
