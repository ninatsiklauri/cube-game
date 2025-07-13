import * as PIXI from "pixi.js";
import { Application } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", width: 500, height: 500 });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  interface Ball extends PIXI.Graphics {
    vx: number;
    vy: number;
    radius: number;
  }

  const balls: Ball[] = [];

  function createBall(): void {
    const radius = 20 + Math.random() + 30;
    const color = Math.floor(Math.random() * 0xffffff);

    const ball = new PIXI.Graphics() as Ball;
    ball.beginFill(color);
    ball.drawCircle(0, 0, radius);
    ball.endFill();

    ball.x = radius + Math.random() * (app.screen.width - 2 * radius);
    ball.y = radius + Math.random() * (app.screen.height - 2 * radius);

    ball.vx = (Math.random() - 0.5) * 10;
    ball.vy = (Math.random() - 0.5) * 10;
    ball.radius = radius;

    app.stage.addChild(ball);
    balls.push(ball);
  }

  for (let i = 0; i < 10; i++) {
    createBall();
  }

  app.ticker.add(() => {
    for (const ball of balls) {
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - ball.radius < 0 || ball.x + ball.radius > app.screen.width) {
        ball.vx *= -1;
      }

      if (
        ball.y - ball.radius < 0 ||
        ball.y + ball.radius > app.screen.height
      ) {
        ball.vy *= -1;
      }
    }
  });
})();
