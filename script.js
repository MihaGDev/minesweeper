class Minesweeper {
    constructor() {
        this.rows = 9;
        this.cols = 9;
        this.mines = 10;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = 0;
        this.timerInterval = null;
        this.minesLeft = this.mines;
        this.revealedCount = 0;
        this.board = [];
        this.minePositions = [];
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.createBoard();
        this.updateDisplay();
    }
    
    createBoard() {
        const minefield = document.getElementById('minefield');
        minefield.innerHTML = '';
        
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                this.board[row][col] = {
                    element: cell,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
                
                minefield.appendChild(cell);
            }
        }
    }
    
    setupEventListeners() {
        const minefield = document.getElementById('minefield');
        const smileyButton = document.getElementById('smiley-button');
        
        minefield.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.handleCellClick(e.target);
            }
        });
        
        minefield.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('cell')) {
                this.handleRightClick(e.target);
            }
        });
        
        smileyButton.addEventListener('click', () => {
            this.resetGame();
        });
        
        // Title bar controls
        document.querySelector('.close').addEventListener('click', () => {
            if (confirm('Are you sure you want to exit?')) {
                window.close();
            }
        });
        
        document.querySelector('.minimize').addEventListener('click', () => {
            // Simulate minimize
            document.body.style.display = 'none';
            setTimeout(() => {
                document.body.style.display = 'flex';
            }, 1000);
        });
        
        document.querySelector('.maximize').addEventListener('click', () => {
            // Toggle fullscreen-like behavior
            document.body.classList.toggle('maximized');
        });
    }
    
    handleCellClick(cell) {
        if (this.gameOver || cell.classList.contains('flagged')) {
            return;
        }
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (!this.gameStarted) {
            this.startGame(row, col);
        }
        
        if (this.board[row][col].isMine) {
            this.gameOver = true;
            this.revealAllMines();
            this.updateSmiley('lost');
            this.stopTimer();
            this.updateStatus('Game Over!');
        } else {
            this.revealCell(row, col);
            if (this.checkWin()) {
                this.gameWon();
            }
        }
    }
    
    handleRightClick(cell) {
        if (this.gameOver || cell.classList.contains('revealed')) {
            return;
        }
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (!this.gameStarted) {
            this.startGame(row, col);
        }
        
        this.toggleFlag(row, col);
    }
    
    startGame(firstRow, firstCol) {
        this.gameStarted = true;
        this.placeMines(firstRow, firstCol);
        this.calculateNeighborMines();
        this.startTimer();
        this.updateStatus('Playing...');
        this.updateSmiley('playing');
    }
    
    placeMines(firstRow, firstCol) {
        this.minePositions = [];
        let minesPlaced = 0;
        
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Don't place mine on first click or if already a mine
            if ((row === firstRow && col === firstCol) || 
                this.board[row][col].isMine) {
                continue;
            }
            
            this.board[row][col].isMine = true;
            this.minePositions.push({row, col});
            minesPlaced++;
        }
    }
    
    calculateNeighborMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }
    
    countNeighborMines(row, col) {
        let count = 0;
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                if (this.board[r][c].isMine) {
                    count++;
                }
            }
        }
        return count;
    }
    
    revealCell(row, col) {
        if (this.board[row][col].isRevealed || this.board[row][col].isFlagged) {
            return;
        }
        
        this.board[row][col].isRevealed = true;
        this.board[row][col].element.classList.add('revealed');
        this.revealedCount++;
        
        if (this.board[row][col].neighborMines > 0) {
            this.board[row][col].element.textContent = this.board[row][col].neighborMines;
            this.board[row][col].element.dataset.count = this.board[row][col].neighborMines;
        } else {
            // Reveal neighbors for empty cells
            for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                    this.revealCell(r, c);
                }
            }
        }
    }
    
    toggleFlag(row, col) {
        const cell = this.board[row][col];
        
        if (cell.isFlagged) {
            cell.isFlagged = false;
            cell.element.classList.remove('flagged');
            this.minesLeft++;
        } else {
            cell.isFlagged = true;
            cell.element.classList.add('flagged');
            this.minesLeft--;
        }
        
        this.updateMineCount();
    }
    
    revealAllMines() {
        this.minePositions.forEach(({row, col}) => {
            this.board[row][col].element.classList.add('revealed', 'mine');
        });
    }
    
    checkWin() {
        return this.revealedCount === (this.rows * this.cols - this.mines);
    }
    
    gameWon() {
        this.gameOver = true;
        this.updateSmiley('won');
        this.stopTimer();
        this.updateStatus('You Won!');
        
        // Flag all mines
        this.minePositions.forEach(({row, col}) => {
            if (!this.board[row][col].isFlagged) {
                this.board[row][col].isFlagged = true;
                this.board[row][col].element.classList.add('flagged');
            }
        });
        this.minesLeft = 0;
        this.updateMineCount();
    }
    
    startTimer() {
        this.timer = 0;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        const timerElement = document.getElementById('timer');
        timerElement.textContent = this.timer.toString().padStart(3, '0');
    }
    
    updateMineCount() {
        const mineCountElement = document.getElementById('mine-count');
        mineCountElement.textContent = this.minesLeft.toString().padStart(2, '0');
    }
    
    updateSmiley(state) {
        const smileyButton = document.getElementById('smiley-button');
        
        switch(state) {
            case 'ready':
                smileyButton.textContent = ':)';
                smileyButton.classList.remove('game-over');
                break;
            case 'playing':
                smileyButton.textContent = ':o';
                smileyButton.classList.remove('game-over');
                break;
            case 'won':
                smileyButton.textContent = '8)';
                smileyButton.classList.remove('game-over');
                break;
            case 'lost':
                smileyButton.textContent = ':(';
                smileyButton.classList.add('game-over');
                break;
        }
    }
    
    updateStatus(text) {
        const statusElement = document.querySelector('.status-text');
        statusElement.textContent = text;
    }
    
    updateDisplay() {
        this.updateMineCount();
        this.updateTimer();
        this.updateSmiley('ready');
        this.updateStatus('Ready');
    }
    
    resetGame() {
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = 0;
        this.minesLeft = this.mines;
        this.revealedCount = 0;
        this.minePositions = [];
        
        this.stopTimer();
        this.createBoard();
        this.updateDisplay();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
}); 