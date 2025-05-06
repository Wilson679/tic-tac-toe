document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    root: document.getElementById("root"),
    gameContainer: document.querySelector(".game-container"),
    board: document.getElementById("board"),
    status: document.getElementById("status"),
    resetBtn: document.getElementById("resetBtn"),
    replayBtn: document.getElementById("replayBtn"),
    startGameBtn: document.getElementById("startGameBtn"),
    roomIdInput: document.getElementById("roomId"),
    joinRoomBtn: document.getElementById("joinRoomBtn"),
    createRoomBtn: document.getElementById("createRoomBtn"),
    onlineStatus: document.getElementById("onlineStatus"),
    difficultyOptions: document.getElementById("difficultyOptions"),
  };

  let currentPlayer = "X";
  let gameActive = true;
  let gameMode = "twoPlayer";
  let difficulty = "easy";
  let roomId = null;
  let ablyChannel = null;

  // 获取 Ably Token
  async function getAblyToken() {
    try {
      const response = await fetch('/api/ably');
      if (!response.ok) throw new Error('Failed to fetch Ably token');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // Initialize Ably client with token
  getAblyToken().then(tokenRequest => {
    if (tokenRequest) {
      const ably = new Ably.Realtime.Promise({ authUrl: '/api/ably' });

      // Initialize board
      function initializeBoard() {
        elements.board.innerHTML = "";
        for (let i = 0; i < 9; i++) {
          const cell = document.createElement("div");
          cell.className = "cell";
          cell.dataset.index = i;
          cell.addEventListener("click", handleCellClick);
          elements.board.appendChild(cell);
        }
        elements.status.textContent = `Current Player: ${currentPlayer}`;
      }

      // Handle cell click
      function handleCellClick(event) {
        const cell = event.target;
        if (!gameActive || cell.textContent) return;

        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());

        if (checkWin()) {
          endGame(`${currentPlayer} wins!`);
          return;
        }

        if (isDraw()) {
          endGame("It's a draw!");
          return;
        }

        if (gameMode === "singlePlayer") {
          currentPlayer = "O";
          elements.status.textContent = `Current Player: ${currentPlayer}`;
          setTimeout(computerMove, 500);
        } else if (gameMode === "twoPlayer" && ablyChannel) {
          ablyChannel.publish("makeMove", { index: cell.dataset.index, player: currentPlayer });
          switchPlayer();
        }
      }

      // Check win condition
      function checkWin() {
        const winPatterns = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8],
          [0, 3, 6], [1, 4, 7], [2, 5, 8],
          [0, 4, 8], [2, 4, 6],
        ];
        return winPatterns.some(pattern => {
          const [a, b, c] = pattern;
          return (
            elements.board.children[a].textContent === currentPlayer &&
            elements.board.children[a].textContent === elements.board.children[b].textContent &&
            elements.board.children[a].textContent === elements.board.children[c].textContent
          );
        });
      }

      // Check draw condition
      function isDraw() {
        return Array.from(elements.board.children).every(cell => cell.textContent);
      }

      // End game
      function endGame(message) {
        elements.status.textContent = message;
        gameActive = false;
        elements.resetBtn.style.display = "block";
        elements.replayBtn.style.display = "block";
        if (gameMode === "twoPlayer" && ablyChannel) {
          ablyChannel.publish("gameOver", { winner: currentPlayer });
        }
      }

      // Switch player
      function switchPlayer() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        elements.status.textContent = `Current Player: ${currentPlayer}`;
      }

      // 电脑移动逻辑
      function computerMove() {
        const emptyCells = Array.from(elements.board.children).filter(cell => !cell.textContent);
        const move = difficulty === "easy"
          ? emptyCells[Math.floor(Math.random() * emptyCells.length)]
          : findBestMove() || emptyCells[Math.floor(Math.random() * emptyCells.length)];

        if (move) {
          move.textContent = "O";
          move.classList.add("o");
          if (checkWin()) {
            endGame("O wins!");
            return;
          }
          if (isDraw()) {
            endGame("It's a draw!");
            return;
          }
          currentPlayer = "X";
          elements.status.textContent = `Current Player: ${currentPlayer}`;
        }
      }

      // 简化的最佳移动逻辑
      function findBestMove() {
        return Array.from(elements.board.children).find(cell => !cell.textContent);
      }

      // 创建房间
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

      // Reset game
      elements.resetBtn.addEventListener("click", () => {
        currentPlayer = "X";
        gameActive = true;
        elements.resetBtn.style.display = "none";
        elements.replayBtn.style.display = "none";
        initializeBoard();
        if (gameMode === "twoPlayer" && ablyChannel) {
          ablyChannel.publish("resetGame", {});
        }
      });

      // 重新开始游戏
      elements.replayBtn.addEventListener("click", () => {
        currentPlayer = "X";
        gameActive = true;
        elements.resetBtn.style.display = "none";
        elements.replayBtn.style.display = "none";
        initializeBoard();
        status.textContent = `当前玩家: ${currentPlayer}`;
      });

      // Start game
      elements.startGameBtn.addEventListener("click", () => {
        const selectedGameMode = document.querySelector('input[name="gameMode"]:checked').value;
        gameMode = selectedGameMode;

        if (gameMode === "singlePlayer") {
          difficulty = document.querySelector('input[name="difficulty"]:checked').value;
        }

        elements.root.style.display = "none";
        elements.gameContainer.style.display = "block";
        initializeBoard();
      });

      // Initialize
      elements.gameContainer.style.display = "none";

      // 更新选项显示逻辑
      document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
        radio.addEventListener("change", () => {
          difficultyOptions.style.display = radio.value === "singlePlayer" ? "block" : "none";
        });
      });
    }
  });
});
