document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");
    const gameContainer = document.querySelector(".game-container");
    const board = document.getElementById("board");
    const status = document.getElementById("status");
    const resetBtn = document.getElementById("resetBtn");
    const replayBtn = document.getElementById("replayBtn");
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
    let ablyChannel = null; // Ably 通道

    // 初始化 Ably 客户端
    const ablyApiKey = "__ABLY_API_KEY__"; // 占位符，稍后通过构建时替换
    const ably = new Ably.Realtime.Promise({ key: ablyApiKey });

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
            replayBtn.style.display = "block";
            if (gameMode === "twoPlayer" && ablyChannel) {
                ablyChannel.publish("gameOver", { winner: currentPlayer });
            }
            return;
        }

        if (Array.from(board.children).every(cell => cell.textContent)) {
            status.textContent = "平局!";
            gameActive = false;
            resetBtn.style.display = "block";
            replayBtn.style.display = "block";
            if (gameMode === "twoPlayer" && ablyChannel) {
                ablyChannel.publish("gameOver", { winner: "draw" });
            }
            return;
        }

        if (gameMode === "singlePlayer") {
            currentPlayer = "O";
            status.textContent = `当前玩家: ${currentPlayer}`;
            setTimeout(computerMove, 500); // 电脑延迟移动
        } else if (gameMode === "twoPlayer" && ablyChannel) {
            ablyChannel.publish("makeMove", { index: cell.dataset.index, player: currentPlayer });
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
    createRoomBtn.addEventListener("click", async () => {
        roomId = Math.random().toString(36).substring(2, 8); // 生成随机房间号
        onlineStatus.textContent = `房间已创建，房间号: ${roomId}`;
        ablyChannel = await ably.channels.get(`tic-tac-toe-${roomId}`);

        ablyChannel.subscribe("playerJoined", () => {
            onlineStatus.textContent = "玩家已加入，游戏开始！";
            initializeBoard();
        });

        ablyChannel.subscribe("makeMove", (message) => {
            const { index, player } = message.data;
            const cell = board.children[index];
            cell.textContent = player;
            cell.classList.add(player.toLowerCase());
            currentPlayer = player === "X" ? "O" : "X";
            status.textContent = `当前玩家: ${currentPlayer}`;
        });

        ablyChannel.subscribe("gameOver", (message) => {
            const { winner } = message.data;
            if (winner === "draw") {
                status.textContent = "平局!";
            } else {
                status.textContent = `${winner} 赢了!`;
            }
            gameActive = false;
            resetBtn.style.display = "block";
            replayBtn.style.display = "block";
        });

        ablyChannel.publish("playerJoined", {});
    });

    // 加入房间
    joinRoomBtn.addEventListener("click", async () => {
        const inputRoomId = roomIdInput.value.trim();
        if (!inputRoomId) {
            onlineStatus.textContent = "请输入有效的房间号！";
            return;
        }
        roomId = inputRoomId;
        ablyChannel = await ably.channels.get(`tic-tac-toe-${roomId}`);

        ablyChannel.subscribe("makeMove", (message) => {
            const { index, player } = message.data;
            const cell = board.children[index];
            cell.textContent = player;
            cell.classList.add(player.toLowerCase());
            currentPlayer = player === "X" ? "O" : "X";
            status.textContent = `当前玩家: ${currentPlayer}`;
        });

        ablyChannel.subscribe("gameOver", (message) => {
            const { winner } = message.data;
            if (winner === "draw") {
                status.textContent = "平局!";
            } else {
                status.textContent = `${winner} 赢了!`;
            }
            gameActive = false;
            resetBtn.style.display = "block";
            replayBtn.style.display = "block";
        });

        ablyChannel.publish("playerJoined", {});
        onlineStatus.textContent = `已加入房间: ${roomId}`;
        initializeBoard();
    });

    // 重置游戏
    resetBtn.addEventListener("click", () => {
        currentPlayer = "X";
        gameActive = true;
        resetBtn.style.display = "none";
        replayBtn.style.display = "none";
        initializeBoard();
        if (gameMode === "twoPlayer" && ablyChannel) {
            ablyChannel.publish("resetGame", {});
        }
    });

    // 重新开始游戏
    replayBtn.addEventListener("click", () => {
        currentPlayer = "X";
        gameActive = true;
        resetBtn.style.display = "none";
        replayBtn.style.display = "none";
        initializeBoard();
        status.textContent = `当前玩家: ${currentPlayer}`;
    });

    // 开始游戏按钮
    startGameButton.addEventListener("click", () => {
        const selectedGameMode = document.querySelector('input[name="gameMode"]:checked').value;
        gameMode = selectedGameMode;

        if (gameMode === "singlePlayer") {
            difficulty = document.querySelector('input[name="difficulty"]:checked').value;
        }

        root.style.display = "none";
        gameContainer.style.display = "block";
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
