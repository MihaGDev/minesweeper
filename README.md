# 🎮 Minesweeper - Windows 3.1 Style

A nostalgic Windows 3.1-style Minesweeper game with modern multiplayer features and voice chat!

## ✨ Features

### 🎯 **Scoring System**
- **Real-time scoring** with points for each cell revealed
- **Time bonuses** for fast completion
- **Efficiency bonuses** for smart flag usage
- **Difficulty multipliers** (Beginner 1x, Intermediate 2x, Expert 3x)
- **High score tracking** with persistent localStorage storage
- **Multiplayer scoring** with 50% bonus when playing with others

### 🌐 **Multiplayer Mode**
- **Room-based multiplayer** - Create or join rooms with unique IDs
- **Real-time player list** showing all connected players
- **Host system** - Room creator has special privileges
- **Live score tracking** for all players
- **Game state synchronization** between players
- **Player notifications** when others make moves
- **Clean multiplayer** - No bots, only real players



### 🎨 **Classic Windows 3.1 UI**
- **Authentic retro styling** with proper Windows 3.1 colors
- **Title bar controls** (minimize, maximize, close)
- **Menu bar** with Game, High Scores, Multiplayer, and Voice options
- **Digital LED displays** for timer, mine count, and score
- **Classic button styling** with proper 3D effects

## 🚀 How to Play

### Setup Multiplayer Server
1. **Install Node.js** if you haven't already
2. **Run the startup script**: Double-click `start.bat` (Windows) or run:
   ```bash
   npm install
   node server.js
   ```
3. **Start the game server**: In another terminal, run:
   ```bash
   python -m http.server 8000
   ```
4. **Open the game**: Go to `http://localhost:8000` in your browser

### Single Player
1. **Click cells** to reveal them
2. **Right-click** to place/remove flags
3. **Avoid mines** and reveal all safe cells to win
4. **Beat your high scores** by playing faster and more efficiently

### Multiplayer
1. **Start the server** using the setup instructions above
2. **Click "Multiplayer"** in the menu bar
3. **Create a room** (leave room ID empty) or **join existing** (enter room ID)
4. **Share your room ID** with friends
5. **Play together** with real players across different browsers/devices!

## 🎯 Scoring System

### Base Scoring
- **10 points** per cell revealed
- **1000 base points** for winning
- **Time bonus**: Up to 3000 points for fast completion
- **Efficiency bonus**: Points for using fewer flags

### Multiplayer Bonuses
- **50% score multiplier** when playing with others
- **Team coordination** rewards
- **Competitive scoring** between players

### Difficulty Multipliers
- **Beginner**: 1x multiplier
- **Intermediate**: 2x multiplier  
- **Expert**: 3x multiplier

## 🛠️ Technical Features



### Multiplayer Architecture
- **Room-based system** with unique IDs
- **Player synchronization** with game state
- **Real-time notifications** for player actions
- **Host authority** for room management

### Local Storage
- **Persistent high scores** across sessions
- **Player preferences** storage
- **Game state backup** for recovery

## 🎮 Controls

- **Left Click**: Reveal cell
- **Right Click**: Place/remove flag
- **Smiley Button**: Reset game
- **Menu Items**: Access features and settings

## 🌟 Future Enhancements

- **Video chat** support
- **Custom difficulty** settings
- **Tournament mode** with brackets
- **Achievement system** with badges
- **Leaderboards** with global rankings

---

**Enjoy the classic Minesweeper experience with modern multiplayer features!** 🎉 