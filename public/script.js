document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");
    const gameContainer = document.querySelector(".game-container");
    const board = document.getElementById("board");
    const status = document.getElementById("status");
    const resetBtn = document.getElementById("resetBtn");
    const replayBtn = document.getElementById("replayBtn"); // 重新开始按钮
    const startGameButton = document.getElementById("startGameBtn");
    const roomIdInput = document.getElementById("roomId");
    const joinRoomBtn = document.getElementById("joinRoomBtn");
    const createRoomBtn = document.getElementById("createRoomBtn");
    const onlineStatus = document.getElementById("onlineStatus");
    const difficultyOptions = document.getElementById("difficultyOptions");

    let currentPlayer = "X";
    let gameActive = true;
    let gameMode = "twoPlayer"; // 默认双人模式
    let difficulty = "easy"; // 默认简单模式
    let roomId = null;

    // 初始化棋盘
    function initializeBoard() {
        board.innerHTML = ""; // 清空棋盘
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.index = i;
            cell.addEventListener("click", handleCellClick);
            board.appendChild(cell);
        }
        status.textContent = `当前玩家: ${currentPlayer}`;
    }

    // 处理格子点击事件
    function handleCellClick(event) {
        const cell = event.target;
        if (!gameActive || cell.textContent) return;

        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());

        if (checkWin()) {
            status.textContent = `${currentPlayer} 赢了!`;
            gameActive = false;
            resetBtn.style.display = "block";
            replayBtn.style.display = "block"; // 显示重新开始按钮
            return;
        }

        if (Array.from(board.children).every(cell => cell.textContent)) {
            status.textContent = "平局!";
            gameActive = false;
            resetBtn.style.display = "block";
            replayBtn.style.display = "block"; // 显示重新开始按钮
            return;
        }

        if (gameMode === "singlePlayer") {
            currentPlayer = "O";
            status.textContent = `当前玩家: ${currentPlayer}`;
            setTimeout(computerMove, 500); // 电脑延迟移动
        } else {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            status.textContent = `当前玩家: ${currentPlayer}`;
        }
    }

    // 检查胜利条件
    function checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // 行
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // 列
            [0, 4, 8], [2, 4, 6]            // 对角线
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return (
                board.children[a].textContent === currentPlayer &&
                board.children[a].textContent === board.children[b].textContent &&
                board.children[a].textContent === board.children[c].textContent
            );
        });
    }

    // 电脑移动逻辑
    function computerMove() {
        let emptyCells = Array.from(board.children).filter(cell => !cell.textContent);
        let move;

        if (difficulty === "easy") {
            // 简单模式：随机选择一个空格子
            move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        } else if (difficulty === "medium") {
            // 中等模式：尝试阻止玩家胜利或优先获胜
            move = findBestMove() || emptyCells[Math.floor(Math.random() * emptyCells.length)];
        } else {
            // 困难模式：使用高级算法选择最佳移动
            move = findBestMove();
        }

        if (move) {
            move.textContent = "O";
            move.classList.add("o");
            if (checkWin()) {
                status.textContent = "O 赢了!";
                gameActive = false;
                resetBtn.style.display = "block";
                replayBtn.style.display = "block"; // 显示重新开始按钮
                return;
            }

            if (Array.from(board.children).every(cell => cell.textContent)) {
                status.textContent = "平局!";
                gameActive = false;
                resetBtn.style.display = "block";
                replayBtn.style.display = "block"; // 显示重新开始按钮
                return;
            }

            currentPlayer = "X";
            status.textContent = `当前玩家: ${currentPlayer}`;
        }
    }

    // 寻找最佳移动（困难模式）
    function findBestMove() {
        // 简化的最佳移动逻辑
        return Array.from(board.children).find(cell => !cell.textContent);
    }

    // 创建房间
    createRoomBtn.addEventListener("click", () => {
        roomId = Math.random().toString(36).substring(2, 8); // 生成随机房间号
        onlineStatus.textContent = `房间已创建，房间号: ${roomId}`;
    });

    // 加入房间
    joinRoomBtn.addEventListener("click", () => {
        const inputRoomId = roomIdInput.value.trim();
        if (!inputRoomId) {
            onlineStatus.textContent = "请输入有效的房间号！";
            return;
        }
        roomId = inputRoomId;
        onlineStatus.textContent = `已加入房间: ${roomId}`;
    });

    // 重置游戏
    resetBtn.addEventListener("click", () => {
        currentPlayer = "X";
        gameActive = true;
        resetBtn.style.display = "none";
        replayBtn.style.display = "none"; // 隐藏重新开始按钮
        initializeBoard();
    });

    // 重新开始游戏
    replayBtn.addEventListener("click", () => {
        root.style.display = "block"; // 显示欢迎界面
        gameContainer.style.display = "none"; // 隐藏游戏界面
        resetBtn.style.display = "none"; // 隐藏重置按钮
        replayBtn.style.display = "none"; // 隐藏重新开始按钮
    });

    // 开始游戏按钮
    startGameButton.addEventListener("click", () => {
        const selectedGameMode = document.querySelector('input[name="gameMode"]:checked').value;
        gameMode = selectedGameMode;

        if (gameMode === "singlePlayer") {
            difficulty = document.querySelector('input[name="difficulty"]:checked').value;
        }

        root.style.display = "none"; // 隐藏欢迎界面
        gameContainer.style.display = "block"; // 显示游戏界面
        initializeBoard();
    });

    // 初始化
    gameContainer.style.display = "none";

    // 更新选项显示逻辑
    document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
        radio.addEventListener("change", () => {
            difficultyOptions.style.display = radio.value === "singlePlayer" ? "block" : "none";
        });
    });
});
