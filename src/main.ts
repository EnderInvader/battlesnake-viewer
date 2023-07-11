import {
  App,
  MarkdownPostProcessorContext,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";
import { SVGBoard, SVGBoardOptions } from "./battlesnakesvg/index";

export default class BattleSnakeViewer extends Plugin {
  // This field stores your plugin settings.
  setting: BattleSnakeViewerSettings;

  onInit() {}

  async onload() {
    this.setting = (await this.loadData()) || {
      squareColor: "#a1a1a1",
    };
    this.addSettingTab(new BattleSnakeViewerSettingsTab(this.app, this));
    this.refreshMarkdownCodeBlockProcessor();
  }

  refreshMarkdownCodeBlockProcessor() {
    this.registerMarkdownCodeBlockProcessor(
      "battlesnake",
      this.draw_board()
    );
  }

  private draw_board() {
    return (
      source: string,
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext
    ) => {
      const parsedCode = BattleSnakeViewer.parseCode(source);
      const board = SVGBoard.fromJSON(parsedCode, this.setting);

      const xmlns = "http://www.w3.org/2000/svg";
      const boxWidth = board.squareSize * board.json.board.width;
      const boxHeight = board.squareSize * board.json.board.height;
      const block = document.createElementNS(xmlns, "svg");
      block.setAttributeNS(null, "viewBox", `0 0 ${boxWidth} ${boxHeight}`);
      block.setAttributeNS(null, "width", String(boxWidth));
      block.setAttributeNS(null, "height", String(boxHeight));
      block.appendChild(board.draw());
      block.style.display = "block";
      el.appendChild(block);
    };
  }

  private static parseCode(input: string): any {
    let json = JSON.parse(input);
    return json;
  }
}

/**
 * This is a data class that contains your plugin configurations. You can edit it
 * as you wish by adding fields and all the data you need.
 */
interface BattleSnakeViewerSettings extends SVGBoardOptions {
  
}

class BattleSnakeViewerSettingsTab extends PluginSettingTab {
  plugin: BattleSnakeViewer;

  constructor(app: App, plugin: BattleSnakeViewer) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.setting;

    containerEl.empty();

    //containerEl.createEl("h2", { text: "BattleSnake Viewer Settings" });

    new Setting(containerEl)
      .setName("Square color")
      .setDesc('Set the color of the grid squares.')
      .addText((text) =>
        text.setValue(String(settings.squareColor)).onChange((value) => {
          settings.squareColor = value;
          this.plugin.refreshMarkdownCodeBlockProcessor();
          this.plugin.saveData(settings);
        })
      );
  }
}
