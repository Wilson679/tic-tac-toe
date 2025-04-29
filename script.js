// 游戏状态变量
document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const cells = document.querySelectorAll(".cell");
    const status = document.getElementById("status");
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    const difficultyOptions = document.getElementById("difficultyOptions");
    let currentPlayer = "X";
    let gameMode = "twoPlayer";
    let difficulty = "easy";
    let gameActive = false;

    // 初始化游戏
    startBtn.addEventListener("click", () => {
        gameMode = document.querySelector('input[name="gameMode"]:checked').value;
        currentPlayer = document.querySelector('input[name="firstPlayer"]:checked').value;
        difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy";
        board.style.display = "grid";
        resetBtn.style.display = "inline-block";
        startBtn.style.display = "none";
        status.textContent = `当前玩家: ${currentPlayer}`;
        gameActive = true;

        if (gameMode === "singlePlayer") {
            difficultyOptions.style.display = "block";
        } else {
            difficultyOptions.style.display = "none";
        }

        cells.forEach(cell => {
            cell.textContent = "";
            cell.classList.remove("x", "o");
        });
    });

    // 处理格子点击
    cells.forEach(cell => {
        cell.addEventListener("click", () => {
            if (!gameActive || cell.textContent) return;

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
        });
    });

    // 重置游戏
    resetBtn.addEventListener("click", () => {
        board.style.display = "none";
        resetBtn.style.display = "none";
        startBtn.style.display = "inline-block";
        status.textContent = "请选择选项并点击\"开始游戏\"";
        gameActive = false;
    });

    // 电脑移动逻辑
    function computerMove() {
        if (!gameActive) return;

        let emptyCells = Array.from(cells).filter(cell => !cell.textContent);
        let move;

        if (difficulty === "easy") {
            move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        } else if (difficulty === "medium") {
            move = findBestMove() || emptyCells[Math.floor(Math.random() * emptyCells.length)];
        } else {
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
        // 在这里实现一个基本的AI算法（例如，极小化极大算法）用于困难模式
        // 占位符：现在返回null
        return null;
    }
});