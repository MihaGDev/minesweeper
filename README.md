# Minesweeper - Windows 3.1 Style

A faithful recreation of the classic Windows 3.1 Minesweeper game built with HTML, CSS, and JavaScript.

## Features

- **Classic Windows 3.1 UI**: Authentic gray color scheme and 3D borders
- **9x9 Grid**: Standard beginner difficulty with 10 mines
- **Timer**: Tracks your solving time
- **Mine Counter**: Shows remaining mines
- **Smiley Button**: Click to reset the game
- **Right-click Flagging**: Right-click to place/remove flags
- **Auto-reveal**: Empty cells automatically reveal neighboring cells
- **Win/Lose Detection**: Proper game over and victory conditions

## How to Play

1. **Open the Game**: Open `index.html` in your web browser
2. **Left-click**: Reveal a cell
3. **Right-click**: Place or remove a flag on suspected mine locations
4. **Objective**: Reveal all non-mine cells without clicking on any mines
5. **Numbers**: Show how many mines are adjacent to that cell
6. **Reset**: Click the smiley face to start a new game

## Game Controls

- **Left Mouse Button**: Reveal cell
- **Right Mouse Button**: Place/remove flag
- **Smiley Button**: Reset game
- **Title Bar Buttons**: Minimize, maximize, or close (simulated)

## Game Rules

- The game starts when you make your first click
- Numbers indicate how many mines are adjacent to that cell
- Empty cells (no adjacent mines) automatically reveal their neighbors
- Flag all mines and reveal all safe cells to win
- Clicking on a mine ends the game

## Files

- `index.html` - Main HTML structure
- `style.css` - Windows 3.1 style CSS
- `script.js` - Game logic and functionality
- `README.md` - This file

## Browser Compatibility

Works in all modern browsers that support:
- CSS Grid
- ES6 Classes
- Event Listeners
- CSS Custom Properties

## Credits

Inspired by the classic Windows 3.1 Minesweeper game. Built with vanilla JavaScript for maximum compatibility and authentic retro experience. 