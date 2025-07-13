import * as PIXI from "pixi.js";
import { Application } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#ffffff", width: 500, height: 500 });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const padding = 10;

  interface GameState {
    level: number;
    gridSize: number;
    baseColor: number;
    diffColor: number;
    oddIndex: number;
  }

  function generateBaseColor(): number {
    const color = Math.floor(Math.random() * 0xffffff);
    return color;
  }

  function getDifferentColor(base: number): number {
    const offset = 0x1010 * 10;
    return base + offset;
  }

  function renderGrid(state: GameState): void {
    const size = app.screen.width / state.gridSize - padding;
    for (let i = 0; i < state.gridSize ** 2; i++) {
      const box = new PIXI.Graphics();
      const color = i === state.oddIndex ? state.diffColor : state.baseColor;
      box.beginFill(color);
      box.drawRect(0, 0, size, size);
      box.endFill();

      box.x = (i % state.gridSize) * (size + padding);
      box.y = Math.floor(i / state.gridSize) * (size + padding);

      box.interactive = true;
      box.on("pointerdown", () => handleClick(i === state.oddIndex));
      app.stage.addChild(box);
    }

    function handleClick(correct: boolean) {
      if (correct) {
        nextLevel();
      } else {
        gameOver();
      }
    }
  }

  function nextLevel() {
    app.stage.removeChildren();
    const level = currentState.level + 1;
    const gridSize = Math.min(2 + Math.floor(level / 3), 8);
    const baseColor = generateBaseColor();
    const diffColor = getDifferentColor(baseColor);
    const oddIndex = Math.floor(Math.random() * (gridSize * gridSize));

    currentState = {
      level,
      gridSize,
      baseColor,
      diffColor,
      oddIndex,
    };

    renderGrid(currentState);
  }

  function gameOver() {
    app.stage.removeChildren();
    const gameOverText = new PIXI.Text("Game Over!", {
      fontSize: 48,
      fill: 0xff0000,
    });
    gameOverText.x = app.screen.width / 2 - gameOverText.width / 2;
    gameOverText.y = app.screen.height / 2 - gameOverText.height / 2;
    app.stage.addChild(gameOverText);

    setTimeout(() => {
      startGame();
    }, 2000);
  }

  let currentState: GameState;

  function startGame() {
    currentState = {
      level: 1,
      gridSize: 2,
      baseColor: generateBaseColor(),
      diffColor: 0,
      oddIndex: 0,
    };
    currentState.diffColor = getDifferentColor(currentState.baseColor);
    currentState.oddIndex = Math.floor(
      Math.random() * currentState.gridSize ** 2,
    );
    renderGrid(currentState);
  }

  startGame();
})();
