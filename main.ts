
// If you see errors in VS Code, install the Obsidian API types with:
// npm install obsidian
import { Plugin, TFile, normalizePath, PluginSettingTab, App, Setting, TextComponent, ExtraButtonComponent } from "obsidian";

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
