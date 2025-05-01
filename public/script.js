document.addEventListener("DOMContentLoaded", () => {
    console.log("Welcome to Tic Tac Toe!");

    const root = document.getElementById("root");

    const container = document.createElement("div");
    container.className = "container";

    const heading = document.createElement("h1");
    heading.textContent = "Welcome to Tic-Tac-Toe";

    const paragraph = document.createElement("p");
    paragraph.textContent = "This is the homepage of your Next.js application.";

    container.appendChild(heading);
    container.appendChild(paragraph);
    root.appendChild(container);

    const gameContainer = document.querySelector(".game-container");
    const startGameButton = document.createElement("button");

    // 创建进入游戏的按钮
    startGameButton.textContent = "进入游戏";
    startGameButton.style.padding = "10px 20px";
    startGameButton.style.fontSize = "16px";
    startGameButton.style.margin = "20px auto";
    startGameButton.style.display = "block";
    startGameButton.style.backgroundColor = "#1e88e5";
    startGameButton.style.color = "white";
    startGameButton.style.border = "none";
    startGameButton.style.borderRadius = "5px";
    startGameButton.style.cursor = "pointer";

    // 初始隐藏游戏容器
    gameContainer.style.display = "none";

    // 按钮点击事件：显示游戏容器并隐藏按钮
    startGameButton.addEventListener("click", () => {
        root.style.display = "none"; // 隐藏欢迎界面
        gameContainer.style.display = "block"; // 显示游戏界面
    });

    // 将按钮添加到欢迎界面
    root.appendChild(startGameButton);
});
