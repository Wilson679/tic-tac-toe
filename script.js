document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const cells = Array.from({ length: 9 }, (_, i) => {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.index = i;
        board.appendChild(cell);
        return cell;
    });
    const status = document.getElementById("status");
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    const difficultyOptions = document.getElementById("difficultyOptions");
    const onlineOptions = document.getElementById("onlineOptions");
    const roomIdInput = document.getElementById("roomId");
    const joinRoomBtn = document.getElementById("joinRoomBtn");
    const createRoomBtn = document.getElementById("createRoomBtn");
    const onlineStatus = document.getElementById("onlineStatus");
    let currentPlayer = "X";
    let gameMode = "twoPlayer";
    let connectionMode = "offline";
    let difficulty = "easy";
    let gameActive = false;
    let socket = null;
    let roomId = null;

    // 确保按钮元素存在并绑定事件监听器
    if (!startBtn || !createRoomBtn || !joinRoomBtn || !resetBtn) {
        console.error("某些按钮未正确初始化，请检查 HTML 文件中的按钮 ID 是否正确");
        return; // 如果按钮未正确初始化，停止执行
    }

    // 提醒：不要在代码中上传浏览器的私密信息
    console.log("提醒：确保代码中没有上传 Cookies、LocalStorage 或其他敏感信息的逻辑。");

    // 初始化 Ably 客户端
    const ably = new Ably.Realtime.Promise({ key: "your-ably-api-key" }); // 替换为实际的 Ably API 密钥

    // 创建房间
    createRoomBtn.addEventListener("click", () => {
        console.log("创建房间按钮被点击");
        ably.channels.get("tic-tac-toe").publish("createRoom", { roomId: "12345" });
        onlineStatus.textContent = "已创建房间，等待其他玩家加入...";
    });

    // 加入房间
    joinRoomBtn.addEventListener("click", () => {
        const inputRoomId = roomIdInput.value.trim();
        if (!inputRoomId) {
            onlineStatus.textContent = "请输入有效的房间号！";
            return;
        }
        console.log("加入房间按钮被点击");
        ably.channels.get("tic-tac-toe").publish("joinRoom", { roomId: inputRoomId });
        onlineStatus.textContent = `已加入房间: ${inputRoomId}`;
    });

    // 监听 Ably 消息
    const channel = ably.channels.get("tic-tac-toe");
    channel.subscribe("updateBoard", (message) => {
        const { index, player } = message.data;
        cells[index].textContent = player;
        cells[index].classList.add(player.toLowerCase());
        currentPlayer = player === "X" ? "O" : "X";
        status.textContent = `当前玩家: ${currentPlayer}`;
    });

    channel.subscribe("gameOver", (message) => {
        status.textContent = message.data.message;
        gameActive = false;
    });

    const playAgainBtn = document.createElement("button");
    playAgainBtn.id = "playAgainBtn";
    playAgainBtn.textContent = "再次游戏";
    playAgainBtn.style.display = "none";
    document.querySelector(".game-container").appendChild(playAgainBtn);

    const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
    const connectionModeRadios = document.querySelectorAll('input[name="connectionMode"]');

    // 确保私密信息不会被上传
    // 提醒：不要在代码中访问 Cookies、LocalStorage 或其他敏感信息
    console.log("提醒：请勿在代码中上传浏览器的私密信息，如 Cookies 或 LocalStorage。");

    // 添加私密消息输入框和发送按钮
    const privateMessageContainer = document.createElement("div");
    privateMessageContainer.id = "privateMessageContainer";
    privateMessageContainer.style.display = "none";
    privateMessageContainer.innerHTML = `
        <input type="text" id="privateMessageInput" placeholder="输入私密消息" />
        <button id="sendPrivateMessageBtn">发送</button>
        <p id="privateMessageStatus" style="color: #888; font-size: 14px; margin-top: 5px;"></p>
    `;
    document.querySelector(".game-container").appendChild(privateMessageContainer);

    const privateMessageInput = document.getElementById("privateMessageInput");
    const sendPrivateMessageBtn = document.getElementById("sendPrivateMessageBtn");
    const privateMessageStatus = document.getElementById("privateMessageStatus");

    // 监听发送私密消息按钮
    sendPrivateMessageBtn.addEventListener("click", () => {
        const message = privateMessageInput.value.trim();
        if (!message) {
            privateMessageStatus.textContent = "消息不能为空！";
            return;
        }

        if (socket && roomId) {
            socket.emit("privateMessage", { roomId, message });
            privateMessageStatus.textContent = "私密消息已发送！";
            privateMessageInput.value = "";
        } else {
            privateMessageStatus.textContent = "无法发送消息，请检查连接状态！";
        }
    });

    // 更新选项显示逻辑
    function updateOptions() {
        const connectionMode = document.querySelector('input[name="connectionMode"]:checked').value;
        const gameMode = document.querySelector('input[name="gameMode"]:checked').value;

        if (connectionMode === "online") {
            onlineOptions.style.display = "block";
            difficultyOptions.style.display = "none";
        } else {
            onlineOptions.style.display = "none";
            if (gameMode === "singlePlayer") {
                difficultyOptions.style.display = "block";
            } else {
                difficultyOptions.style.display = "none";
            }
        }

        privateMessageContainer.style.display = connectionMode === "online" ? "block" : "none";
    }

    // 监听模式选择变化
    connectionModeRadios.forEach(radio => {
        radio.addEventListener("change", updateOptions);
    });

    gameModeRadios.forEach(radio => {
        radio.addEventListener("change", updateOptions);
    });

    // 初始化游戏
    startBtn.addEventListener("click", () => {
        const connectionMode = document.querySelector('input[name="connectionMode"]:checked').value;
        const gameMode = document.querySelector('input[name="gameMode"]:checked').value;

        if (connectionMode === "online" && gameMode === "singlePlayer") {
            alert("在线模式下不支持单人模式，请选择双人模式！");
            return;
        }

        currentPlayer = document.querySelector('input[name="firstPlayer"]:checked').value;
        difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy";

        board.style.display = "grid";
        resetBtn.style.display = "inline-block";
        startBtn.style.display = "none";
        status.textContent = `当前玩家: ${currentPlayer}`;
        gameActive = true;

        cells.forEach(cell => {
            cell.textContent = "";
            cell.classList.remove("x", "o");
        });

        playAgainBtn.style.display = "none";
        console.log("开始游戏按钮被点击");
    });

    // 创建房间
    createRoomBtn.addEventListener("click", () => {
        if (!socket) {
            socket = io("https://your-socket-server.com"); // 替换为实际的服务器地址
            console.log("Socket.IO 已初始化");
        }

        console.log("创建房间按钮被点击");
        socket.emit("createRoom", {}, (response) => {
            if (response && response.success) {
                roomId = response.roomId;
                currentPlayer = "X"; // 房主默认先手
                status.textContent = `已创建房间，房间号: ${roomId}，您是 X`;
                onlineStatus.textContent = "等待其他玩家加入...";
                onlineOptions.style.display = "none";
                board.style.display = "grid";
                resetBtn.style.display = "inline-block";
                startBtn.style.display = "none";
                gameActive = true;
            } else {
                onlineStatus.textContent = "创建房间失败，请重试！";
                console.error("创建房间失败，服务器未返回成功响应");
            }
        });

        setupSocketListeners();
    });

    // 加入房间
    joinRoomBtn.addEventListener("click", () => {
        if (!socket) socket = io(); // 确保 Socket.IO 已初始化
        console.log("加入房间按钮被点击");
        const inputRoomId = roomIdInput.value.trim();
        if (!inputRoomId) {
            onlineStatus.textContent = "请输入有效的房间号！";
            return;
        }

        socket.emit("joinRoom", { roomId: inputRoomId }, (response) => {
            if (response.success) {
                roomId = inputRoomId;
                currentPlayer = "O"; // 加入者默认后手
                status.textContent = `已加入房间，房间号: ${roomId}，您是 O`;
                onlineStatus.textContent = "已成功加入房间，等待对手操作...";
                onlineOptions.style.display = "none";
                board.style.display = "grid";
                resetBtn.style.display = "inline-block";
                startBtn.style.display = "none";
                gameActive = true;
            } else {
                onlineStatus.textContent = "加入房间失败，请检查房间号！";
            }
        });

        setupSocketListeners();
    });

    // 设置 Socket.IO 事件监听
    function setupSocketListeners() {
        if (!socket) {
            console.error("Socket.IO 未初始化，无法设置事件监听");
            return;
        }

        socket.on("updateBoard", (data) => {
            // 更新棋盘状态
            cells[data.index].textContent = data.player;
            cells[data.index].classList.add(data.player.toLowerCase());
            currentPlayer = data.nextPlayer;
            status.textContent = `当前玩家: ${currentPlayer === "X" ? "X (您)" : "O (对手)"}`;
        });

        socket.on("gameOver", (data) => {
            status.textContent = data.message;
            gameActive = false;
            playAgainBtn.style.display = "inline-block";
        });

        socket.on("playerJoined", () => {
            onlineStatus.textContent = "对手已加入，开始游戏！";
        });

        socket.on("playerLeft", () => {
            onlineStatus.textContent = "对手已离开房间，游戏结束。";
            gameActive = false;
        });

        socket.on("restartGame", () => {
            cells.forEach(cell => {
                cell.textContent = "";
                cell.classList.remove("x", "o");
            });
            currentPlayer = "X";
            status.textContent = `当前玩家: ${currentPlayer}`;
            gameActive = true;
            playAgainBtn.style.display = "none";
            onlineStatus.textContent = "游戏已重启，等待对手操作。";
        });

        socket.on("error", (error) => {
            onlineStatus.textContent = `错误: ${error.message}`;
            console.error("Socket.IO 错误:", error);
        });

        socket.on("privateMessage", (data) => {
            alert(`私密消息: ${data.message}`);
        });
    }

    // 处理格子点击
    cells.forEach(cell => {
        cell.addEventListener("click", () => {
            if (!gameActive || cell.textContent || connectionMode !== "online") return;

            if ((currentPlayer === "X" && !socket.id.includes("X")) || (currentPlayer === "O" && !socket.id.includes("O"))) {
                alert("请等待您的回合！");
                return;
            }

            cell.textContent = currentPlayer;
            cell.classList.add(currentPlayer.toLowerCase());
            socket.emit("makeMove", {
                roomId,
                index: cell.dataset.index,
                player: currentPlayer,
                nextPlayer: currentPlayer === "X" ? "O" : "X"
            });

            if (checkWin(currentPlayer)) {
                status.textContent = `${currentPlayer} 赢了!`;
                socket.emit("gameOver", { roomId, message: `${currentPlayer} 赢了!` });
                gameActive = false;
                return;
            }

            if (Array.from(cells).every(cell => cell.textContent)) {
                status.textContent = "平局!";
                socket.emit("gameOver", { roomId, message: "平局!" });
                gameActive = false;
                return;
            }

            currentPlayer = currentPlayer === "X" ? "O" : "X";
            status.textContent = `当前玩家: ${currentPlayer}`;
        });
    });

    // 重置游戏
    resetBtn.addEventListener("click", () => {
        console.log("重置游戏按钮被点击");
        board.style.display = "none";
        resetBtn.style.display = "none";
        startBtn.style.display = "inline-block";
        status.textContent = "请选择选项并点击\"开始游戏\"";
        gameActive = false;
        if (socket) {
            socket.emit("leaveRoom", { roomId });
            socket.disconnect();
            socket = null;
        }
        playAgainBtn.style.display = "none";
    });

    // 再次游戏逻辑
    playAgainBtn.addEventListener("click", () => {
        console.log("再次游戏按钮被点击");
        if (socket && roomId) {
            socket.emit("restartGame", { roomId });
        }
        cells.forEach(cell => {
            cell.textContent = "";
            cell.classList.remove("x", "o");
        });
        currentPlayer = "X";
        status.textContent = `当前玩家: ${currentPlayer}`;
        gameActive = true;
        playAgainBtn.style.display = "none";
    });

    // 电脑移动逻辑
    function computerMove() {
        let emptyCells = Array.from(cells).filter(cell => !cell.textContent);
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
            if (checkWin("O")) {
                status.textContent = "O 赢了!";
                gameActive = false;
                return;
            }

            if (Array.from(cells).every(cell => cell.textContent)) {
                status.textContent = "平局!";
                gameActive = false;
                return;
            }

            currentPlayer = "X";
            status.textContent = `当前玩家: ${currentPlayer}`;
        }
    }

    // 检查胜利
    function checkWin(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => 
            pattern.every(index => cells[index].textContent === player)
        );
    }

    // 寻找最佳移动（困难模式）
    function findBestMove() {
        const scores = { X: -1, O: 1, tie: 0 };

        function minimax(boardState, isMaximizing) {
            // 检查是否有胜利或平局
            const winner = getWinner(boardState);
            if (winner) return scores[winner];

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < boardState.length; i++) {
                    if (!boardState[i]) {
                        boardState[i] = "O";
                        let score = minimax(boardState, false);
                        boardState[i] = null;
                        bestScore = Math.max(score, bestScore);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < boardState.length; i++) {
                    if (!boardState[i]) {
                        boardState[i] = "X";
                        let score = minimax(boardState, true);
                        boardState[i] = null;
                        bestScore = Math.min(score, bestScore);
                    }
                }
                return bestScore;
            }
        }

        function getWinner(boardState) {
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];

            for (const pattern of winPatterns) {
                const [a, b, c] = pattern;
                if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
                    return boardState[a];
                }
            }

            if (boardState.every(cell => cell)) return "tie";
            return null;
        }

        // 将当前棋盘状态转换为数组
        const boardState = Array.from(cells).map(cell => cell.textContent || null);

        let bestMove = null;
        let bestScore = -Infinity;

        for (let i = 0; i < boardState.length; i++) {
            if (!boardState[i]) {
                boardState[i] = "O";
                let score = minimax(boardState, false);
                boardState[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = cells[i];
                }
            }
        }

        return bestMove;
    }

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
});