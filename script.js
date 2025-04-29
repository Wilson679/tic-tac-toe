let currentPlayer = 'X';
let gameActive = true;
const board = ['', '', '', '', '', '', '', '', ''];
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横线
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // 竖线
    [0, 4, 8], [2, 4, 6]             // 对角线
];

function handleCellClick(e) {
    const index = e.target.getAttribute('data-index');
    
    if (board[index] !== '' || !gameActive) return;
    
    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;
    
    if (checkWin()) {
        document.getElementById('status').textContent = `玩家 ${currentPlayer} 赢了！`;
        gameActive = false;
        return;
    }
    
    if (board.every(cell => cell !== '')) {
        document.getElementById('status').textContent = '平局！';
        gameActive = false;
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('status').textContent = `轮到: ${currentPlayer}`;
}

function checkWin() {
    return winningConditions.some(condition => {
        return condition.every(index => {
            return board[index] === currentPlayer;
        });
    });
}

function resetGame() {
    currentPlayer = 'X';
    gameActive = true;
    board.fill('');
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
    });
    document.getElementById('status').textContent = `轮到: X`;
}

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});