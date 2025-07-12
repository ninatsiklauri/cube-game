import { Application } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", width: 500, height: 500 });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);
})();
