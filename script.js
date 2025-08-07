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
        
        // Multiplayer system
        this.isMultiplayer = false;
        this.roomId = null;
        this.playerId = this.generatePlayerId();
        this.players = new Map();
        this.isHost = false;
        this.peerConnections = new Map();
        this.localStream = null;
        this.remoteStreams = new Map();
        
        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        this.initializeGame();
        this.setupEventListeners();
        this.initializeMultiplayer();
    }
    
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    initializeMultiplayer() {
        this.setupVoiceChat();
        this.setupMultiplayerUI();
    }
    
    setupVoiceChat() {
        // Request microphone access
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.localStream = stream;
                this.updateVoiceStatus('Connected');
            })
            .catch(err => {
                console.log('Microphone access denied:', err);
                this.updateVoiceStatus('No Mic');
            });
    }
    
    setupMultiplayerUI() {
        // Add multiplayer controls to the menu
        const menuBar = document.querySelector('.menu-bar');
        const multiplayerBtn = document.createElement('div');
        multiplayerBtn.className = 'menu-item';
        multiplayerBtn.id = 'multiplayer-btn';
        multiplayerBtn.textContent = 'Multiplayer';
        menuBar.appendChild(multiplayerBtn);
        
        // Add voice chat controls
        const voiceBtn = document.createElement('div');
        voiceBtn.className = 'menu-item';
        voiceBtn.id = 'voice-btn';
        voiceBtn.textContent = 'Voice: Off';
        menuBar.appendChild(voiceBtn);
        
        // Event listeners
        multiplayerBtn.addEventListener('click', () => {
            this.toggleMultiplayer();
        });
        
        voiceBtn.addEventListener('click', () => {
            this.toggleVoiceChat();
        });
    }
    
    toggleMultiplayer() {
        if (!this.isMultiplayer) {
            this.createOrJoinRoom();
        } else {
            this.leaveRoom();
        }
    }
    
    createOrJoinRoom() {
        const roomId = prompt('Enter room ID to join, or leave empty to create new room:');
        
        if (roomId === null) return;
        
        if (roomId.trim() === '') {
            // Create new room
            this.roomId = this.generateRoomId();
            this.isHost = true;
            this.updateStatus(`Created room: ${this.roomId}`);
        } else {
            // Join existing room
            this.roomId = roomId.trim();
            this.isHost = false;
            this.updateStatus(`Joined room: ${this.roomId}`);
        }
        
        this.isMultiplayer = true;
        this.updateMultiplayerUI();
        this.startMultiplayerGame();
    }
    
    generateRoomId() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    
    leaveRoom() {
        this.isMultiplayer = false;
        this.roomId = null;
        this.isHost = false;
        this.players.clear();
        this.peerConnections.clear();
        this.remoteStreams.clear();
        
        // Stop all peer connections
        this.peerConnections.forEach(connection => {
            connection.close();
        });
        
        // Remove multiplayer class
        document.querySelector('.game-container').classList.remove('multiplayer');
        
        // Remove players list
        const playersContainer = document.querySelector('.players-container');
        if (playersContainer) {
            playersContainer.remove();
        }
        
        this.updateStatus('Left multiplayer room');
        this.updateMultiplayerUI();
        this.resetGame();
    }
    
    startMultiplayerGame() {
        // Add current player to players list
        this.players.set(this.playerId, {
            id: this.playerId,
            name: `Player ${this.playerId.slice(-4)}`,
            score: 0,
            isHost: this.isHost
        });
        
        // Start voice chat if enabled
        if (this.localStream) {
            this.startVoiceChat();
        }
        
        // Add multiplayer class to container
        document.querySelector('.game-container').classList.add('multiplayer');
        
        this.updatePlayersList();
        this.updateStatus(`Multiplayer room ${this.roomId} ready for players`);
    }
    

    
    createPeerConnection(peerId) {
        const peerConnection = new RTCPeerConnection(this.rtcConfig);
        
        // Add local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.localStream);
            });
        }
        
        // Handle incoming streams
        peerConnection.ontrack = (event) => {
            this.remoteStreams.set(peerId, event.streams[0]);
            this.updateVoiceStatus('Voice Active');
        };
        
        this.peerConnections.set(peerId, peerConnection);
        
        this.updateStatus(`Peer connection established with ${peerId}`);
    }
    
    startVoiceChat() {
        this.updateVoiceStatus('Voice Active');
        this.updateStatus('Voice chat started');
    }
    
    toggleVoiceChat() {
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn.textContent.includes('Off')) {
            voiceBtn.textContent = 'Voice: On';
            this.startVoiceChat();
        } else {
            voiceBtn.textContent = 'Voice: Off';
            this.updateVoiceStatus('Voice Muted');
        }
    }
    
    updateVoiceStatus(status) {
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) {
            voiceBtn.textContent = `Voice: ${status}`;
        }
    }
    
    updateMultiplayerUI() {
        const multiplayerBtn = document.getElementById('multiplayer-btn');
        if (multiplayerBtn) {
            if (this.isMultiplayer) {
                multiplayerBtn.textContent = `Room: ${this.roomId}`;
                multiplayerBtn.style.backgroundColor = '#000080';
                multiplayerBtn.style.color = 'white';
            } else {
                multiplayerBtn.textContent = 'Multiplayer';
                multiplayerBtn.style.backgroundColor = '';
                multiplayerBtn.style.color = '';
            }
        }
    }
    
    updatePlayersList() {
        const playersList = document.getElementById('players-list');
        if (!playersList) {
            this.createPlayersList();
        }
        
        const playersListElement = document.getElementById('players-list');
        playersListElement.innerHTML = '';
        
        this.players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-item';
            playerElement.innerHTML = `
                <span class="player-name">${player.name}</span>
                <span class="player-score">${player.score}</span>
                ${player.isHost ? '<span class="host-badge">Host</span>' : ''}
            `;
            playersListElement.appendChild(playerElement);
        });
    }
    
    createPlayersList() {
        const gameBoard = document.querySelector('.game-board');
        const playersContainer = document.createElement('div');
        playersContainer.className = 'players-container';
        playersContainer.innerHTML = `
            <div class="players-header">Players (${this.players.size})</div>
            <div id="players-list" class="players-list"></div>
        `;
        gameBoard.appendChild(playersContainer);
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
            
            // Notify other players in multiplayer
            if (this.isMultiplayer) {
                this.notifyOtherPlayers('gameOver', { playerId: this.playerId });
            }
        } else {
            this.revealCell(row, col);
            if (this.checkWin()) {
                this.gameWon();
            }
            
            // Notify other players in multiplayer
            if (this.isMultiplayer) {
                this.notifyOtherPlayers('cellRevealed', { 
                    row, 
                    col, 
                    playerId: this.playerId,
                    score: this.currentScore 
                });
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
        
        const finalScore = this.isMultiplayer ? this.calculateMultiplayerScore() : this.calculateScore();
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
        
        // Notify other players in multiplayer
        if (this.isMultiplayer) {
            this.notifyOtherPlayers('gameWon', { 
                playerId: this.playerId, 
                score: finalScore 
            });
            this.updateStatus(`🎉 ${this.players.get(this.playerId)?.name} won the game!`);
        }
        
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
    
    // Multiplayer notification methods
    notifyOtherPlayers(action, data) {
        // In a real implementation, this would send data via WebSocket
        console.log(`Multiplayer action: ${action}`, data);
        
        // Log the action for debugging
        this.updateStatus(`Multiplayer action: ${action}`);
    }
    

    
    // Enhanced scoring for multiplayer
    calculateMultiplayerScore() {
        let baseScore = this.calculateScore();
        
        // Bonus for playing with others
        if (this.isMultiplayer && this.players.size > 1) {
            baseScore = Math.floor(baseScore * 1.5); // 50% bonus for multiplayer
        }
        
        return baseScore;
    }
    
    // Voice chat methods
    sendVoiceMessage(message) {
        if (this.isMultiplayer && this.localStream) {
            this.updateStatus(`Voice: ${message}`);
            // In real implementation, this would send audio data
        }
    }
    
    // Multiplayer game synchronization
    syncGameState() {
        if (this.isMultiplayer) {
            const gameState = {
                board: this.board,
                revealedCount: this.revealedCount,
                minesLeft: this.minesLeft,
                timer: this.timer,
                gameOver: this.gameOver,
                currentScore: this.currentScore
            };
            
            // In real implementation, this would sync with other players
            console.log('Syncing game state:', gameState);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
}); 