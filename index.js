const mainCube = document.querySelector(".main-cube");
const cubes = document.querySelector(".cubes");
const timer = document.getElementById("timer");
const score = document.getElementById("score");

let count = 0;
let time = 30;
let x = 0;

cubes.addEventListener("click", () => {
    let randomX = Math.floor(Math.random() * 440);
    let randomY = Math.floor(Math.random() * 440);
    let randomColor = Math.floor(Math.random() * 16777215).toString(16);
    let randomBckgrnd = Math.floor(Math.random() * 16777215).toString(16);

    cubes.style.marginLeft = randomX + "px";
    cubes.style.marginTop = randomY + "px";

    count++;
    score.textContent = "my score : " + count;

    cubes.style.backgroundColor = `#${randomColor}`;
    mainCube.style.backgroundColor = `#${randomBckgrnd}`;
    x++;
    if (x === 1) {
        startInterval();
    }
});

function startInterval() {
    let int = setInterval(() => {
        time--;
        timer.textContent = "timer : " + time;
        if (time === 0) {
            Swal.fire(`your score is ${count}`);
            const confirmBtn = document.querySelector(".swal2-confirm");
            confirmBtn.addEventListener("click", () => {
                time = 30;
                timer.textContent = "timer : " + time;
                count = 0;
                score.textContent = "my score : " + count;
                startInterval();
            });
            clearInterval(int);
        }
    }, 1000);
}