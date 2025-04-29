document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const cells = document.querySelectorAll(".cell");
    const status = document.getElementById("status");
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    const difficultyOptions = document.getElementById("difficultyOptions");
    const onlineOptions = document.getElementById("onlineOptions");
    const roomIdInput = document.getElementById("roomId");
    const joinRoomBtn = document.getElementById("joinRoomBtn");
    const createRoomBtn = document.getElementById("createRoomBtn");
    let currentPlayer = "X";
    let gameMode = "twoPlayer";
    let connectionMode = "offline";
    let difficulty = "easy";
    let gameActive = false;
    let socket = null;
    let roomId = null;

    // 初始化游戏
    startBtn.addEventListener("click", () => {
        connectionMode = document.querySelector('input[name="connectionMode"]:checked').value;
        gameMode = document.querySelector('input[name="gameMode"]:checked').value;
        currentPlayer = document.querySelector('input[name="firstPlayer"]:checked').value;
        difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy";

        if (connectionMode === "online") {
            onlineOptions.style.display = "block";
            difficultyOptions.style.display = "none";
        } else {
            onlineOptions.style.display = "none";
            if (gameMode === "singlePlayer") {
                difficultyOptions.style.display = "block";
            }
            board.style.display = "grid";
            resetBtn.style.display = "inline-block";
            startBtn.style.display = "none";
            status.textContent = `当前玩家: ${currentPlayer}`;
            gameActive = true;

            cells.forEach(cell => {
                cell.textContent = "";
                cell.classList.remove("x", "o");
            });
        }
    });

    // 创建房间
    createRoomBtn.addEventListener("click", () => {
        socket = io(); // 假设使用 Socket.IO
        socket.emit("createRoom", {}, (response) => {
            roomId = response.roomId;
            status.textContent = `已创建房间，房间号: ${roomId}`;
            onlineOptions.style.display = "none";
            board.style.display = "grid";
            resetBtn.style.display = "inline-block";
            startBtn.style.display = "none";
            gameActive = true;
        });

        setupSocketListeners();
    });

    // 加入房间
    joinRoomBtn.addEventListener("click", () => {
        const inputRoomId = roomIdInput.value.trim();
        if (!inputRoomId) {
            alert("请输入房间号！");
            return;
        }

        socket = io(); // 假设使用 Socket.IO
        socket.emit("joinRoom", { roomId: inputRoomId }, (response) => {
            if (response.success) {
                roomId = inputRoomId;
                status.textContent = `已加入房间，房间号: ${roomId}`;
                onlineOptions.style.display = "none";
                board.style.display = "grid";
                resetBtn.style.display = "inline-block";
                startBtn.style.display = "none";
                gameActive = true;
            } else {
                alert("加入房间失败，请检查房间号！");
            }
        });

        setupSocketListeners();
    });

    // 设置 Socket.IO 事件监听
    function setupSocketListeners() {
        socket.on("updateBoard", (data) => {
            cells[data.index].textContent = data.player;
            cells[data.index].classList.add(data.player.toLowerCase());
            currentPlayer = data.nextPlayer;
            status.textContent = `当前玩家: ${currentPlayer}`;
        });

        socket.on("gameOver", (data) => {
            status.textContent = data.message;
            gameActive = false;
        });
    }

    // 处理格子点击
    cells.forEach(cell => {
        cell.addEventListener("click", () => {
            if (!gameActive || cell.textContent) return;

            if (connectionMode === "online") {
                socket.emit("makeMove", {
                    roomId,
                    index: cell.dataset.index,
                    player: currentPlayer
                });
            } else {
                cell.textContent = currentPlayer;
                cell.classList.add(currentPlayer.toLowerCase());
                if (checkWin(currentPlayer)) {
                    status.textContent = `${currentPlayer} 赢了!`;
                    gameActive = false;
                    return;
                }

                if (Array.from(cells).every(cell => cell.textContent)) {
                    status.textContent = "平局!";
                    gameActive = false;
                    return;
                }

                currentPlayer = currentPlayer === "X" ? "O" : "X";
                status.textContent = `当前玩家: ${currentPlayer}`;

                if (gameMode === "singlePlayer" && currentPlayer === "O") {
                    setTimeout(() => computerMove(), 500);
                }
            }
        });
    });

    // 重置游戏
    resetBtn.addEventListener("click", () => {
        board.style.display = "none";
        resetBtn.style.display = "none";
        startBtn.style.display = "inline-block";
        status.textContent = "请选择选项并点击\"开始游戏\"";
        gameActive = false;
        if (socket) {
            socket.disconnect();
            socket = null;
        }
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
});