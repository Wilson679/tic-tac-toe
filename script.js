// 游戏状态变量
let currentPlayer = 'X';
let gameActive = false;
const board = ['', '', '', '', '', '', '', '', ''];
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横线
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // 竖线
    [0, 4, 8], [2, 4, 6]             // 对角线
];

// 统计变量
let stats = {
    wins: 0,
    draws: 0,
    losses: 0
};

// 游戏模式
let gameMode = 'twoPlayer'; // 'twoPlayer' 或 'singlePlayer'
let humanPlayer = 'X';
let aiPlayer = 'O';

// DOM元素
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const cells = document.querySelectorAll('.cell');

// 初始化游戏
function initGame() {
    // 添加事件监听器
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    // 初始隐藏棋盘和重置按钮
    boardElement.style.display = 'none';
    resetBtn.style.display = 'none';
}

// 开始游戏
function startGame() {
    // 获取选项
    gameMode = document.querySelector('input[name="gameMode"]:checked').value;
    humanPlayer = document.querySelector('input[name="firstPlayer"]:checked').value;
    aiPlayer = humanPlayer === 'X' ? 'O' : 'X';
    
    // 重置游戏
    resetGame();
    
    // 显示游戏板
    boardElement.style.display = 'grid';
    resetBtn.style.display = 'inline-block';
    startBtn.style.display = 'none';
    
    // 如果是单人模式且AI先手
    if (gameMode === 'singlePlayer' && currentPlayer === aiPlayer) {
        setTimeout(makeAIMove, 500);
    }
}

// 处理格子点击
function handleCellClick(e) {
    const index = e.target.getAttribute('data-index');
    
    if (board[index] !== '' || !gameActive) return;
    
    // 在单人模式下，确保是人类玩家回合
    if (gameMode === 'singlePlayer' && currentPlayer !== humanPlayer) return;
    
    makeMove(index, currentPlayer);
    
    // 检查游戏是否结束
    if (checkWin()) {
        updateStats(currentPlayer === humanPlayer ? 'win' : 'loss');
        statusElement.textContent = 
            gameMode === 'singlePlayer' 
            ? (currentPlayer === humanPlayer ? '你赢了！' : 'AI赢了！')
            : `玩家 ${currentPlayer} 赢了！`;
        gameActive = false;
        startBtn.style.display = 'inline-block';
        return;
    }
    
    if (board.every(cell => cell !== '')) {
        updateStats('draw');
        statusElement.textContent = '平局！';
        gameActive = false;
        startBtn.style.display = 'inline-block';
        return;
    }
    
    // 切换玩家
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusElement.textContent = 
        gameMode === 'singlePlayer' 
        ? (currentPlayer === humanPlayer ? '轮到你了' : 'AI思考中...')
        : `轮到: ${currentPlayer}`;
    
    // 如果是单人模式且轮到AI
    if (gameMode === 'singlePlayer' && currentPlayer === aiPlayer && gameActive) {
        setTimeout(makeAIMove, 500);
    }
}

// 执行移动
function makeMove(index, player) {
    board[index] = player;
    document.querySelector(`.cell[data-index="${index}"]`).textContent = player;
}

// AI移动
function makeAIMove() {
    if (!gameActive) return;
    
    // 简单AI逻辑：先尝试赢，再阻止玩家赢，然后随机移动
    let move = findWinningMove(aiPlayer) || 
               findWinningMove(humanPlayer) || 
               findBestMove();
    
    makeMove(move, aiPlayer);
    
    // 检查游戏是否结束
    if (checkWin()) {
        updateStats(currentPlayer === humanPlayer ? 'win' : 'loss');
        statusElement.textContent = 'AI赢了！';
        gameActive = false;
        startBtn.style.display = 'inline-block';
        return;
    }
    
    if (board.every(cell => cell !== '')) {
        updateStats('draw');
        statusElement.textContent = '平局！';
        gameActive = false;
        startBtn.style.display = 'inline-block';
        return;
    }
    
    // 切换回人类玩家
    currentPlayer = humanPlayer;
    statusElement.textContent = '轮到你了';
}

// 寻找获胜移动
function findWinningMove(player) {
    for (let condition of winningConditions) {
        let [a, b, c] = condition;
        if (board[a] === player && board[b] === player && board[c] === '') return c;
        if (board[a] === player && board[c] === player && board[b] === '') return b;
        if (board[b] === player && board[c] === player && board[a] === '') return a;
    }
    return null;
}

// 寻找最佳移动（简单策略）
function findBestMove() {
    // 优先选择中心
    if (board[4] === '') return 4;
    
    // 然后选择角落
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => board[index] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // 最后选择边
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(index => board[index] === '');
    if (availableEdges.length > 0) {
        return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }
    
    return null;
}

// 检查胜利
function checkWin() {
    return winningConditions.some(condition => {
        return condition.every(index => {
            return board[index] === currentPlayer;
        });
    });
}

// 重置游戏
function resetGame() {
    currentPlayer = humanPlayer;
    gameActive = true;
    board.fill('');
    cells.forEach(cell => {
        cell.textContent = '';
    });
    statusElement.textContent = 
        gameMode === 'singlePlayer' 
        ? (currentPlayer === humanPlayer ? '轮到你了' : 'AI思考中...')
        : `轮到: ${currentPlayer}`;
    
    startBtn.style.display = 'none';
}

// 更新统计
function updateStats(result) {
    if (result === 'win') stats.wins++;
    else if (result === 'loss') stats.losses++;
    else stats.draws++;
    
    document.getElementById('wins').textContent = stats.wins;
    document.getElementById('draws').textContent = stats.draws;
    document.getElementById('losses').textContent = stats.losses;
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame);