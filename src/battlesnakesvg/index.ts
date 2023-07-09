export type BoardCoordinate = [number, number];

export interface SVGBoardOptions {
  drawCoordinates: boolean;
  squareColor: string;
  foodColor: string;
  hazardColor: string;
  hazardOpacity: string;
  snakeColors: string[];
  snakeHeadColor: string;
}

export class SVGBoard {
  public json: any;
  public squareSize: number;

  private options: SVGBoardOptions;

  private readonly xmlns = "http://www.w3.org/2000/svg";
  private readonly defaultSquareSize = 40;

  private squareColor = "#a1a1a1";
  private foodColor = "red";
  private hazardColor = "616161";
  private hazardOpacity = "0.35";
  private snakeColors = ["green", "#E4601B", "#C51BE4", "#1B9FE4"];
  private snakeHeadColor = "#5c5c5c";

  private constructor(
    json: any,
    {
      drawCoordinates = true,
      squareColor = "#a1a1a1",
      foodColor = "red",
      hazardColor = "616161",
      hazardOpacity = "0.35",
      snakeColors = ["green", "#E4601B", "#C51BE4", "#1B9FE4"],
      snakeHeadColor = "#5c5c5c",
    }: Partial<SVGBoardOptions> = {}
  ) {
    this.json = json;
    this.squareSize = this.defaultSquareSize;
    this.squareColor = squareColor;
    this.foodColor = foodColor;
    this.hazardColor = hazardColor;
    this.hazardOpacity = hazardOpacity;
    this.snakeColors = snakeColors;
    this.snakeHeadColor = snakeHeadColor;

    this.options = {
      drawCoordinates,
      squareColor,
      foodColor,
      hazardColor,
      hazardOpacity,
      snakeColors,
      snakeHeadColor,
    };
  }

  draw(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    g.appendChild(this.drawBoard());

    g.appendChild(this.drawPieces());

    if (this.options.drawCoordinates) {
      g.appendChild(this.drawCoordinateSystem());
    }

    return g;
  }

  private drawBoard(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    for (let r = 0; r < this.json.board.height; r++) {
      for (let c = 0; c < this.json.board.width; c++) {
        g.appendChild(this.drawSquare([c, r]));
      }
    }
    return g;
  }

  private drawPieces(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");

    let num = 1;
    for (const snake of this.json.board.snakes) {
      if (snake.id === this.json.you.id) continue;
      for (const body of snake.body) {
        g.appendChild(this.drawSnakeBody([body.x, this.json.board.height - 1 - body.y], this.snakeColors[num]));
      }
      g.appendChild(this.drawSnakeHead([snake.head.x, this.json.board.height - 1 - snake.head.y]));
      num++;
    }

    for (const body of this.json.you.body) {
      g.appendChild(this.drawSnakeBody([body.x, this.json.board.height - 1 - body.y], this.snakeColors[0]));
    }
    g.appendChild(this.drawSnakeHead([this.json.you.head.x, this.json.board.height - 1 - this.json.you.head.y]));

    for (const food of this.json.board.food) {
      g.appendChild(this.drawFood([food.x, this.json.board.height - 1 - food.y]));
    }
    
    for (const hazard of this.json.board.hazards) {
      g.appendChild(this.drawHazard([hazard.x, this.json.board.height - 1 - hazard.y]));
    }
    
    return g;
  }

  private drawSquare(coord: BoardCoordinate): SVGRectElement {
    let [x, y] = this.getBoardSVGCord(coord);
    let rect = document.createElementNS(this.xmlns, "rect");
    rect.setAttributeNS(null, "x", String(x));
    rect.setAttributeNS(null, "y", String(y));
    rect.setAttributeNS(null, "width", String(this.squareSize));
    rect.setAttributeNS(null, "height", String(this.squareSize));
    rect.setAttributeNS(null, "stroke", "#FFFFFF");
    rect.setAttributeNS(null, "stroke-width", String(this.squareSize / 20));
    rect.setAttributeNS(null, "fill", this.squareColor);
    return rect;
  }

  private drawSnakeHead(coord: BoardCoordinate): SVGGElement {
    let [x, y] = this.getBoardSVGCord(coord);
    let rect = document.createElementNS(this.xmlns, "rect");
    let innerSize = this.squareSize / 2.5;
    let offset = (this.squareSize - innerSize) / 2;
    rect.setAttributeNS(null, "x", String(x + offset));
    rect.setAttributeNS(null, "y", String(y + offset));
    rect.setAttributeNS(null, "rx", String(this.squareSize / 8));
    rect.setAttributeNS(null, "ry", String(this.squareSize / 8));
    rect.setAttributeNS(null, "width", String(innerSize));
    rect.setAttributeNS(null, "height", String(innerSize));
    rect.setAttributeNS(null, "fill", this.snakeHeadColor);
    rect.setAttributeNS(null, "opacity", "0.8");
    return rect;
  }

  private drawSnakeBody(coord: BoardCoordinate, color: string): SVGRectElement {
    let [x, y] = this.getBoardSVGCord(coord);
    let rect = document.createElementNS(this.xmlns, "rect");
    rect.setAttributeNS(null, "x", String(x));
    rect.setAttributeNS(null, "y", String(y));
    rect.setAttributeNS(null, "rx", String(this.squareSize / 4));
    rect.setAttributeNS(null, "ry", String(this.squareSize / 4));
    rect.setAttributeNS(null, "width", String(this.squareSize));
    rect.setAttributeNS(null, "height", String(this.squareSize));
    rect.setAttributeNS(null, "fill", color);
    return rect;
  }

  private drawFood(coord: BoardCoordinate): SVGCircleElement {
    let [x, y] = this.getBoardSVGCord(coord);
    let rect = document.createElementNS(this.xmlns, "circle");
    rect.setAttributeNS(null, "cx", String((this.squareSize / 2) + x));
    rect.setAttributeNS(null, "cy", String((this.squareSize / 2) + y));
    rect.setAttributeNS(null, "r", String(this.squareSize / 4));
    rect.setAttributeNS(null, "fill", this.foodColor);
    return rect;
  }

  private drawHazard(coord: BoardCoordinate): SVGRectElement {
    let [x, y] = this.getBoardSVGCord(coord);
    let rect = document.createElementNS(this.xmlns, "rect");
    rect.setAttributeNS(null, "x", String(x));
    rect.setAttributeNS(null, "y", String(y));
    rect.setAttributeNS(null, "rx", String(this.squareSize / 4));
    rect.setAttributeNS(null, "ry", String(this.squareSize / 4));
    rect.setAttributeNS(null, "width", String(this.squareSize));
    rect.setAttributeNS(null, "height", String(this.squareSize));
    rect.setAttributeNS(null, "fill", this.hazardColor);
    rect.setAttributeNS(null, "opacity", this.hazardOpacity);
    return rect;
  }

  drawCoordinateSystem(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    for (let r = 0; r < this.json.board.height; r++) {
      for (let c = 0; c < this.json.board.width; c++) {
        if (c === 0) {
          g.appendChild(this.drawText([c, r], String(this.json.board.height - r), "row"));
        }
        if (r === this.json.board.height - 1) {
          g.appendChild(
            this.drawText([c, r], String(this.numToLetter(c)), "column")
          );
        }
      }
    }
    return g;
  }

  private drawText(
    [c, r]: BoardCoordinate,
    text: string,
    position: "row" | "column"
  ): SVGElement {
    let [x, y] = this.getBoardSVGCord([c, r]);
    let txt = document.createElementNS(this.xmlns, "text");
    if (position === "row") {
      txt.setAttributeNS(null, "x", String(x + 1));
      txt.setAttributeNS(null, "y", String(y + 10));
    } else {
      txt.setAttributeNS(null, "x", String(x + this.squareSize - 7));
      txt.setAttributeNS(null, "y", String(y + this.squareSize - 2));
    }
    txt.setAttributeNS(null, "font-family", "sans-serif");
    txt.setAttributeNS(null, "font-size", String(10));
    txt.setAttributeNS(
      null,
      "fill",
      "#ffffff"
    );
    txt.textContent = text;
    return txt;
  }

  private numToLetter(num: number): string {
    return String.fromCharCode(97 + num);
  }

  private getBoardSVGCord([c, r]: BoardCoordinate): [number, number] {
    return [c * this.squareSize, r * this.squareSize];
  }

  static fromJSON(
    json: any,
    options: Partial<SVGBoardOptions> = {}
  ) {
    return new SVGBoard(json, options);
  }
}
