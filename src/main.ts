import * as PIXI from "pixi.js";
import { Application } from "pixi.js";
import { Player } from "./player";

(async () => {
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 496;
  const cubePadding = 5;
  const app = new Application();

  await app.init({
    background: "#ffffff",
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const scoreEl = document.getElementById("score")!;
  const timerEl = document.getElementById("timer")!;

  interface GameState {
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
  const player: Player = new Player();
  let nameInputEl: HTMLInputElement | null = null;

  function generateBaseColor(): number {
    return Math.floor(Math.random() * 0xffffff);
  }

  function getDifferentColor(base: number, difficulty: number): number {
    const maxLighten = 60;
    const minLighten = 4;
    const lighten = Math.max(minLighten, maxLighten - difficulty * 1.5);

    const r = Math.round(Math.min(((base >> 16) & 0xff) + lighten, 255));
    const g = Math.round(Math.min(((base >> 8) & 0xff) + lighten, 255));
    const b = Math.round(Math.min((base & 0xff) + lighten, 255));

    return (r << 16) | (g << 8) | b;
  }
  function updateUI() {
    scoreEl.textContent = `Score: ${currentState.score}`;
    timerEl.textContent = `Time: ${currentState.timeLeft}s`;
  }

  function showStartScreen(): void {
    app.stage.removeChildren();
    scoreEl.textContent = "Score: 0";
    timerEl.textContent = "Time: 60s";

    isOnStartScreen = true;

    // Create or show the name input DOM element
    if (!nameInputEl) {
      nameInputEl = document.createElement("input");
      nameInputEl.type = "text";
      nameInputEl.placeholder = "Enter your name";
      nameInputEl.id = "player-name-input";
      nameInputEl.maxLength = 16;
      nameInputEl.style.position = "absolute";
      nameInputEl.style.left = `${app.canvas.getBoundingClientRect().left + CANVAS_WIDTH / 2 - 100}px`;
      nameInputEl.style.top = `${app.canvas.getBoundingClientRect().top + 210}px`;
      nameInputEl.style.width = "200px";
      nameInputEl.style.height = "36px";
      nameInputEl.style.fontSize = "20px";
      nameInputEl.style.textAlign = "center";
      nameInputEl.style.borderRadius = "8px";
      nameInputEl.style.border = "1.5px solid #F06060";
      nameInputEl.style.outline = "none";
      nameInputEl.style.zIndex = "10";
      nameInputEl.style.background = "#fff6f6";
      nameInputEl.style.boxShadow = "0 2px 8px rgba(240,96,96,0.08)";
      document.body.appendChild(nameInputEl);
    } else {
      nameInputEl.value = "";
      nameInputEl.style.display = "block";
    }

    const titleText = new PIXI.Text("Cube Game", {
      fontSize: 36,
      fill: 0x333333,
      fontWeight: "bold",
    });
    titleText.x = CANVAS_WIDTH / 2 - titleText.width / 2;
    titleText.y = 100;
    app.stage.addChild(titleText);

    const instructionText = new PIXI.Text(
      "Find the different colored square!",
      {
        fontSize: 18,
        fill: 0x666666,
      },
    );
    instructionText.x = CANVAS_WIDTH / 2 - instructionText.width / 2;
    instructionText.y = 160;
    app.stage.addChild(instructionText);

    const startButton = new PIXI.Graphics();
    startButton.beginFill(0x4caf50);
    startButton.drawRoundedRect(0, 0, 200, 60, 10);
    startButton.endFill();
    startButton.x = CANVAS_WIDTH / 2 - 100;
    startButton.y = 270;
    startButton.interactive = true;
    startButton.on("pointerdown", () => {
      if (nameInputEl && nameInputEl.value.trim().length > 0) {
        player.name = nameInputEl.value;
        nameInputEl.style.display = "none";
        isOnStartScreen = false;
        startGame();
      } else {
        nameInputEl!.focus();
        nameInputEl!.style.border = "2px solid #ff0000";
        setTimeout(() => {
          nameInputEl!.style.border = "1.5px solid #F06060";
        }, 800);
      }
    });
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

  let isOnStartScreen = false;

  function renderGrid(state: GameState): void {
    if (isOnStartScreen) return;

    const cubeSize = Math.min(
      (CANVAS_WIDTH - (state.gridSize + 1) * cubePadding) / state.gridSize,
      (CANVAS_HEIGHT - (state.gridSize + 1) * cubePadding) / state.gridSize,
    );
    const startX = cubePadding;
    const startY = cubePadding;

    for (let i = 0; i < state.gridSize ** 2; i++) {
      const isOdd = i === state.oddIndex;
      const color = isOdd ? state.diffColor : state.baseColor;

      const x = startX + (i % state.gridSize) * (cubeSize + cubePadding);
      const y =
        startY + Math.floor(i / state.gridSize) * (cubeSize + cubePadding);

      const box = new PIXI.Graphics();
      box.beginFill(color, 1);
      box.drawRoundedRect(0, 0, cubeSize, cubeSize, 8);
      box.endFill();

      box.x = x;
      box.y = y;
      box.interactive = true;
      box.on("pointerdown", () => handleClick(isOdd));

      app.stage.addChild(box);
    }

    function handleClick(correct: boolean) {
      if (correct) {
        nextRound();
      } else {
        gameOver();
      }
    }
  }

  function nextRound(): void {
    app.stage.removeChildren();
    const gridSize = Math.min(2 + Math.floor(currentState.score / 3), 8);
    const baseColor = generateBaseColor();
    const diffColor = getDifferentColor(baseColor, currentState.score + 1);
    const oddIndex = Math.floor(Math.random() * (gridSize * gridSize));

    currentState = {
      ...currentState,
      gridSize,
      baseColor,
      diffColor,
      oddIndex,
      score: currentState.score + 1,
      isPlaying: true,
    };

    updateUI();
    renderGrid(currentState);
  }

  function startTimer(): void {
    if (gameTimer) {
      clearInterval(gameTimer);
    }
    gameTimer = setInterval(() => {
      if (currentState && currentState.isPlaying) {
        currentState.timeLeft--;
        updateUI();
        if (currentState.timeLeft <= 0) {
          gameOver();
        }
      }
    }, 1000);
  }

  function startGame(): void {
    if (nameInputEl) nameInputEl.style.display = "none";
    app.stage.removeChildren();
    isOnStartScreen = false;
    currentState = {
      gridSize: 2,
      baseColor: generateBaseColor(),
      diffColor: 0,
      oddIndex: 0,
      score: 0,
      timeLeft: 60,
      isPlaying: true,
    };
    currentState.diffColor = getDifferentColor(currentState.baseColor, 1);

    currentState.oddIndex = Math.floor(
      Math.random() * currentState.gridSize ** 2,
    );
    updateUI();
    renderGrid(currentState);
    startTimer();
  }

  function gameOver(): void {
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }
    currentState.isPlaying = false;
    app.stage.removeChildren();

    const gameOverText = new PIXI.Text("Game Over!", {
      fontSize: 48,
      fill: 0xff0000,
    });
    gameOverText.x = CANVAS_WIDTH / 2 - gameOverText.width / 2;
    gameOverText.y = 150;
    app.stage.addChild(gameOverText);

    const finalScoreText = new PIXI.Text(`Final Score: ${currentState.score}`, {
      fontSize: 24,
      fill: 0x333333,
    });
    finalScoreText.x = CANVAS_WIDTH / 2 - finalScoreText.width / 2;
    finalScoreText.y = 220;
    app.stage.addChild(finalScoreText);

    const restartButton = new PIXI.Graphics();
    restartButton.beginFill(0x2196f3);
    restartButton.drawRoundedRect(0, 0, 150, 50, 8);
    restartButton.endFill();
    restartButton.x = CANVAS_WIDTH / 2 - 75;
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

  showStartScreen();
})();
