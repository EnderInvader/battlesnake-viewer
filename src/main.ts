import {
  App,
  MarkdownPostProcessorContext,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";
import { SVGChessboard, SVGChessboardOptions } from "./chessboardsvg/index";

export default class ObsidianChess extends Plugin {
  // This field stores your plugin settings.
  setting: ObsidianChessSettings;

  onInit() {}

  async onload() {
    this.setting = (await this.loadData()) || {
      whiteSquareColor: "#f0d9b5",
      blackSquareColor: "#b58862",
    };
    this.addSettingTab(new ObsidianChessSettingsTab(this.app, this));
    this.refreshMarkdownCodeBlockProcessor();
  }

  refreshMarkdownCodeBlockProcessor() {
    this.registerMarkdownCodeBlockProcessor(
      "battlesnake",
      this.draw_chessboard()
    );
  }

  private draw_chessboard() {
    return (
      source: string,
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext
    ) => {
      const parsedCode = ObsidianChess.parseCode(source);
      const chessboard = SVGChessboard.fromJSON(parsedCode, this.setting);

      const xmlns = "http://www.w3.org/2000/svg";
      const boxWidth = 320;
      const boxHeight = 320;
      const block = document.createElementNS(xmlns, "svg");
      block.setAttributeNS(null, "viewBox", `0 0 ${boxWidth} ${boxHeight}`);
      block.setAttributeNS(null, "width", String(boxWidth));
      block.setAttributeNS(null, "height", String(boxHeight));
      block.appendChild(chessboard.draw());
      block.style.display = "block";
      el.appendChild(block);
    };
  }

  private static parseCode(input: string): JSON {
    let json = JSON.parse(input);
    return json;
  }
}

/**
 * This is a data class that contains your plugin configurations. You can edit it
 * as you wish by adding fields and all the data you need.
 */
interface ObsidianChessSettings extends SVGChessboardOptions {
  whiteSquareColor: string;
  blackSquareColor: string;
}

class ObsidianChessSettingsTab extends PluginSettingTab {
  plugin: ObsidianChess;

  constructor(app: App, plugin: ObsidianChess) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.setting;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Obsidian BattleSnake Settings" });

    new Setting(containerEl)
      .setName("White Square Color")
      .setDesc('Set the color of the "white" squares.')
      .addText((text) =>
        text.setValue(String(settings.whiteSquareColor)).onChange((value) => {
          settings.whiteSquareColor = value;
          this.plugin.refreshMarkdownCodeBlockProcessor();
          this.plugin.saveData(settings);
        })
      );

    new Setting(containerEl)
      .setName("Black Square Color")
      .setDesc('Set the color of the "black" squares.')
      .addText((text) =>
        text.setValue(String(settings.blackSquareColor)).onChange((value) => {
          settings.blackSquareColor = value;
          this.plugin.refreshMarkdownCodeBlockProcessor();
          this.plugin.saveData(settings);
        })
      );
  }
}
