import * as PIXI from "pixi.js";
import { Application } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#ffffff", width: 700, height: 700 });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const padding = 10;

  interface GameState {
    level: number;
    gridSize: number;
    baseColor: number;
    diffColor: number;
    oddIndex: number;
    score: number;
    timeLeft: number;
    isPlaying: boolean;
  }

  let gameTimer: number | null = null;
  let currentState: GameState;

  function generateBaseColor(): number {
    const color = Math.floor(Math.random() * 0xffffff);
    return color;
  }

  function getDifferentColor(base: number): number {
    const offset = 0x1010 * 10;
    return base + offset;
  }

  function showStartScreen(): void {
    app.stage.removeChildren();

    const titleText = new PIXI.Text("Kukukube Game", {
      fontSize: 36,
      fill: 0x333333,
      fontWeight: "bold",
    });
    titleText.x = app.screen.width / 2 - titleText.width / 2;
    titleText.y = 100;
    app.stage.addChild(titleText);

    const instructionText = new PIXI.Text(
      "Find the different colored square!",
      {
        fontSize: 18,
        fill: 0x666666,
      },
    );
    instructionText.x = app.screen.width / 2 - instructionText.width / 2;
    instructionText.y = 160;
    app.stage.addChild(instructionText);

    const startButton = new PIXI.Graphics();
    startButton.beginFill(0x4caf50);
    startButton.drawRoundedRect(0, 0, 200, 60, 10);
    startButton.endFill();
    startButton.x = app.screen.width / 2 - 100;
    startButton.y = 250;
    startButton.interactive = true;
    startButton.on("pointerdown", startGame);
    app.stage.addChild(startButton);

    const startText = new PIXI.Text("START GAME", {
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: "bold",
    });
    startText.x = startButton.x + 100 - startText.width / 2;
    startText.y = startButton.y + 30 - startText.height / 2;
    app.stage.addChild(startText);
  }

  function renderGameUI(): void {
    const scoreText = new PIXI.Text(`Score: ${currentState.score}`, {
      fontSize: 20,
      fill: 0x333333,
    });
    scoreText.x = 10;
    scoreText.y = 10;
    app.stage.addChild(scoreText);

    const timerText = new PIXI.Text(`Time: ${currentState.timeLeft}s`, {
      fontSize: 20,
      fill: 0x333333,
    });
    timerText.x = app.screen.width - timerText.width - 10;
    timerText.y = 10;
    app.stage.addChild(timerText);

    const levelText = new PIXI.Text(`Level: ${currentState.level}`, {
      fontSize: 20,
      fill: 0x333333,
    });
    levelText.x = app.screen.width / 2 - levelText.width / 2;
    levelText.y = 10;
    app.stage.addChild(levelText);
  }

  function renderGrid(state: GameState): void {
    const size = app.screen.width / state.gridSize - padding;
    const startY = 60;

    for (let i = 0; i < state.gridSize ** 2; i++) {
      const box = new PIXI.Graphics();
      const color = i === state.oddIndex ? state.diffColor : state.baseColor;
      box.beginFill(color);
      box.drawRect(0, 0, size, size);
      box.endFill();

      box.x = (i % state.gridSize) * (size + padding);
      box.y = startY + Math.floor(i / state.gridSize) * (size + padding);

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

  function startTimer(): void {
    if (gameTimer) {
      clearInterval(gameTimer);
    }

    gameTimer = setInterval(() => {
      if (currentState && currentState.isPlaying) {
        currentState.timeLeft--;

        if (currentState.timeLeft <= 0) {
          gameOver();
        } else {
          app.stage.removeChildren();
          renderGameUI();
          renderGrid(currentState);
        }
      }
    }, 1000);
  }

  function nextLevel(): void {
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
      score: currentState.score + 10 + Math.floor(currentState.timeLeft / 2),
      timeLeft: Math.max(10, 30 - level * 2),
      isPlaying: true,
    };

    renderGameUI();
    renderGrid(currentState);
    startTimer();
  }

  function gameOver(): void {
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }

    app.stage.removeChildren();

    const gameOverText = new PIXI.Text("Game Over!", {
      fontSize: 48,
      fill: 0xff0000,
    });
    gameOverText.x = app.screen.width / 2 - gameOverText.width / 2;
    gameOverText.y = 150;
    app.stage.addChild(gameOverText);

    const finalScoreText = new PIXI.Text(`Final Score: ${currentState.score}`, {
      fontSize: 24,
      fill: 0x333333,
    });
    finalScoreText.x = app.screen.width / 2 - finalScoreText.width / 2;
    finalScoreText.y = 220;
    app.stage.addChild(finalScoreText);

    const levelText = new PIXI.Text(`Level Reached: ${currentState.level}`, {
      fontSize: 20,
      fill: 0x666666,
    });
    levelText.x = app.screen.width / 2 - levelText.width / 2;
    levelText.y = 260;
    app.stage.addChild(levelText);

    const restartButton = new PIXI.Graphics();
    restartButton.beginFill(0x2196f3);
    restartButton.drawRoundedRect(0, 0, 150, 50, 8);
    restartButton.endFill();
    restartButton.x = app.screen.width / 2 - 75;
    restartButton.y = 320;
    restartButton.interactive = true;
    restartButton.on("pointerdown", startGame);
    app.stage.addChild(restartButton);

    const restartText = new PIXI.Text("PLAY AGAIN", {
      fontSize: 18,
      fill: 0xffffff,
      fontWeight: "bold",
    });
    restartText.x = restartButton.x + 75 - restartText.width / 2;
    restartText.y = restartButton.y + 25 - restartText.height / 2;
    app.stage.addChild(restartText);
  }

  function startGame(): void {
    currentState = {
      level: 1,
      gridSize: 2,
      baseColor: generateBaseColor(),
      diffColor: 0,
      oddIndex: 0,
      score: 0,
      timeLeft: 30,
      isPlaying: true,
    };
    currentState.diffColor = getDifferentColor(currentState.baseColor);
    currentState.oddIndex = Math.floor(
      Math.random() * currentState.gridSize ** 2,
    );

    renderGameUI();
    renderGrid(currentState);
    startTimer();
  }

  showStartScreen();
})();
