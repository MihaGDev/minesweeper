const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store active rooms and players
const rooms = new Map();
const players = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    ws.on('close', () => {
        handlePlayerDisconnect(ws);
    });
});

function handleMessage(ws, data) {
    switch (data.type) {
        case 'join_room':
            handleJoinRoom(ws, data);
            break;
        case 'leave_room':
            handleLeaveRoom(ws, data);
            break;
        case 'game_action':
            handleGameAction(ws, data);
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

function handleJoinRoom(ws, data) {
    const { roomId, playerId, playerName } = data;
    
    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            id: roomId,
            players: new Map(),
            gameState: null
        });
    }
    
    const room = rooms.get(roomId);
    const player = {
        id: playerId,
        name: playerName,
        ws: ws,
        roomId: roomId,
        isHost: room.players.size === 0
    };
    
    // Add player to room
    room.players.set(playerId, player);
    players.set(ws, player);
    
    // Notify all players in the room
    broadcastToRoom(roomId, {
        type: 'player_joined',
        player: {
            id: playerId,
            name: playerName,
            isHost: player.isHost
        }
    });
    
    // Send current room state to new player
    ws.send(JSON.stringify({
        type: 'room_state',
        roomId: roomId,
        players: Array.from(room.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            isHost: p.isHost
        })),
        gameState: room.gameState
    }));
    
    console.log(`Player ${playerName} joined room ${roomId}`);
}

function handleLeaveRoom(ws, data) {
    const player = players.get(ws);
    if (!player) return;
    
    const room = rooms.get(player.roomId);
    if (room) {
        room.players.delete(player.id);
        
        // If room is empty, delete it
        if (room.players.size === 0) {
            rooms.delete(player.roomId);
        } else {
            // Notify other players
            broadcastToRoom(player.roomId, {
                type: 'player_left',
                playerId: player.id
            });
        }
    }
    
    players.delete(ws);
    console.log(`Player ${player.name} left room ${player.roomId}`);
}

function handleGameAction(ws, data) {
    const player = players.get(ws);
    if (!player) return;
    
    const room = rooms.get(player.roomId);
    if (!room) return;
    
    // Update room game state
    room.gameState = data.gameState;
    
    // Broadcast action to other players in the room
    broadcastToRoom(player.roomId, {
        type: 'game_action',
        playerId: player.id,
        action: data.action,
        gameState: data.gameState
    }, ws); // Exclude sender
}



function handlePlayerDisconnect(ws) {
    const player = players.get(ws);
    if (player) {
        handleLeaveRoom(ws, { type: 'leave_room' });
    }
}

function broadcastToRoom(roomId, message, excludeWs = null) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.players.forEach(player => {
        if (player.ws !== excludeWs && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(message));
        }
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Minesweeper WebSocket server running on port ${PORT}`);
    console.log(`Active rooms: ${rooms.size}`);
    console.log(`Active players: ${players.size}`);
});

// Log server stats every 30 seconds
setInterval(() => {
    console.log(`Server Stats - Rooms: ${rooms.size}, Players: ${players.size}`);
}, 30000); 