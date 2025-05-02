document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");
    const gameContainer = document.querySelector(".game-container");
    const startGameButton = document.getElementById("startGameBtn");

    // 检查按钮是否存在
    if (!startGameButton) {
        console.error("无法找到开始游戏按钮，请检查 HTML 文件中的按钮 ID 是否正确。");
        return;
    }

    // 初始隐藏游戏容器
    gameContainer.style.display = "none";

    // 按钮点击事件：显示游戏容器并隐藏按钮
    startGameButton.addEventListener("click", () => {
        root.style.display = "none"; // 隐藏欢迎界面
        gameContainer.style.display = "block"; // 显示游戏界面
    });
});
