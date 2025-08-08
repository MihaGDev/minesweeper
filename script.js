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
        
        // Scoring system
        this.currentScore = 0;
        this.highScores = this.loadHighScores();
        this.difficulty = 'beginner'; // beginner, intermediate, expert
        

        
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
        
        // Update grid template based on current dimensions
        minefield.style.gridTemplateColumns = `repeat(${this.cols}, 24px)`;
        minefield.style.gridTemplateRows = `repeat(${this.rows}, 24px)`;
        
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
        
        // High scores button
        const highScoresBtn = document.getElementById('high-scores-btn');
        if (highScoresBtn) {
            highScoresBtn.addEventListener('click', () => {
                this.showHighScores();
            });
        }
        
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
        
        // Add points for revealing cells
        this.currentScore += 10;
        this.updateScoreDisplay();
        
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
    
    calculateScore() {
        // Base score for winning
        let baseScore = 1000;
        
        // Bonus for speed (faster = higher score)
        const timeBonus = Math.max(0, 300 - this.timer) * 10;
        
        // Bonus for difficulty
        let difficultyMultiplier = 1;
        if (this.difficulty === 'intermediate') difficultyMultiplier = 2;
        if (this.difficulty === 'expert') difficultyMultiplier = 3;
        
        // Penalty for flags used (efficiency bonus)
        const flagsUsed = this.mines - this.minesLeft;
        const efficiencyBonus = Math.max(0, this.mines - flagsUsed) * 50;
        
        this.currentScore = Math.floor((baseScore + timeBonus + efficiencyBonus) * difficultyMultiplier);
        return this.currentScore;
    }
    
    loadHighScores() {
        const saved = localStorage.getItem('minesweeper-highscores');
        return saved ? JSON.parse(saved) : {
            beginner: [],
            intermediate: [],
            expert: []
        };
    }
    
    saveHighScore(score, time) {
        const scoreEntry = {
            score: score,
            time: time,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };
        
        this.highScores[this.difficulty].push(scoreEntry);
        this.highScores[this.difficulty].sort((a, b) => b.score - a.score);
        this.highScores[this.difficulty] = this.highScores[this.difficulty].slice(0, 10); // Keep top 10
        
        localStorage.setItem('minesweeper-highscores', JSON.stringify(this.highScores));
    }
    
    isNewHighScore(score) {
        const currentHighs = this.highScores[this.difficulty];
        return currentHighs.length < 10 || score > currentHighs[currentHighs.length - 1].score;
    }
    
    displayHighScores() {
        const scores = this.highScores[this.difficulty];
        let scoreText = `High Scores (${this.difficulty}):\n`;
        
        if (scores.length === 0) {
            scoreText += "No scores yet!";
        } else {
            scores.forEach((entry, index) => {
                scoreText += `${index + 1}. ${entry.score} pts (${entry.time}s) - ${entry.date}\n`;
            });
        }
        
        alert(scoreText);
    }
    
    updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.currentScore.toString().padStart(6, '0');
        }
    }
    
    gameWon() {
        this.gameOver = true;
        this.updateSmiley('won');
        this.stopTimer();
        
        const finalScore = this.calculateScore();
        this.currentScore = finalScore;
        
        // Check if it's a new high score
        const isHighScore = this.isNewHighScore(finalScore);
        
        if (isHighScore) {
            this.updateStatus(`New High Score! ${finalScore} points!`);
            this.saveHighScore(finalScore, this.timer);
        } else {
            this.updateStatus(`You Won! Score: ${finalScore} points`);
        }
        
        this.updateScoreDisplay();
        
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
        this.updateScoreDisplay();
    }
    
    resetGame() {
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = 0;
        this.minesLeft = this.mines;
        this.revealedCount = 0;
        this.minePositions = [];
        this.currentScore = 0;
        
        this.stopTimer();
        this.createBoard();
        this.updateDisplay();
    }
    
    // Add method to show high scores
    showHighScores() {
        this.displayHighScores();
    }
    
    // Method to change difficulty
    setDifficulty(level) {
        this.difficulty = level;
        
        switch(level) {
            case 'beginner':
                this.rows = 9;
                this.cols = 9;
                this.mines = 10;
                break;
            case 'intermediate':
                this.rows = 16;
                this.cols = 16;
                this.mines = 40;
                break;
            case 'expert':
                this.rows = 16;
                this.cols = 30;
                this.mines = 99;
                break;
        }
        
        this.minesLeft = this.mines;
        this.resetGame();
    }
    

}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
}); 