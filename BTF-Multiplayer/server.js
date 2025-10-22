const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// In-memory storage (replace with database in production)
const players = new Map(); // playerId -> { id, username, coins, inventory, fruits, ws }
const tradeOffers = new Map(); // tradeId -> { from, to, fromItems, toItems, status, timestamp }

// Generate unique IDs
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Broadcast to specific player
function sendToPlayer(playerId, message) {
    const player = players.get(playerId);
    if (player && player.ws && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(JSON.stringify(message));
    }
}

// Broadcast to all connected players
function broadcast(message, excludeId = null) {
    players.forEach((player, id) => {
        if (id !== excludeId && player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(message));
        }
    });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
    let playerId = null;

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());

            switch (msg.type) {
                case 'register':
                    // Register player with their game state
                    playerId = msg.playerId || generateId();
                    players.set(playerId, {
                        id: playerId,
                        username: msg.username || `Player_${playerId.slice(0, 6)}`,
                        coins: msg.coins || 0,
                        inventory: msg.inventory || {},
                        fruits: msg.fruits || {},
                        ws: ws,
                        online: true
                    });
                    
                    ws.send(JSON.stringify({
                        type: 'registered',
                        playerId: playerId,
                        message: 'Connected to BTF Server'
                    }));

                    // Broadcast player list update
                    const playerList = Array.from(players.values()).map(p => ({
                        id: p.id,
                        username: p.username,
                        online: p.online
                    }));
                    broadcast({ type: 'playerList', players: playerList });
                    break;

                case 'getPlayers':
                    // Send list of online players
                    const onlinePlayers = Array.from(players.values())
                        .filter(p => p.online && p.id !== playerId)
                        .map(p => ({
                            id: p.id,
                            username: p.username
                        }));
                    ws.send(JSON.stringify({
                        type: 'playerList',
                        players: onlinePlayers
                    }));
                    break;

                case 'proposeTrade':
                    // Create trade offer
                    const tradeId = generateId();
                    const fromPlayer = players.get(playerId);
                    const toPlayer = players.get(msg.toPlayerId);

                    if (!fromPlayer || !toPlayer) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Player not found'
                        }));
                        break;
                    }

                    tradeOffers.set(tradeId, {
                        id: tradeId,
                        from: playerId,
                        to: msg.toPlayerId,
                        fromItems: msg.fromItems || { pets: {}, fruits: {}, coins: 0 },
                        toItems: msg.toItems || { pets: {}, fruits: {}, coins: 0 },
                        status: 'pending',
                        timestamp: Date.now()
                    });

                    // Notify both players
                    sendToPlayer(msg.toPlayerId, {
                        type: 'tradeReceived',
                        trade: {
                            id: tradeId,
                            from: { id: fromPlayer.id, username: fromPlayer.username },
                            fromItems: msg.fromItems,
                            toItems: msg.toItems
                        }
                    });

                    ws.send(JSON.stringify({
                        type: 'tradeSent',
                        tradeId: tradeId,
                        message: 'Trade offer sent'
                    }));
                    break;

                case 'acceptTrade':
                    // Accept trade and execute transfer
                    const trade = tradeOffers.get(msg.tradeId);
                    if (!trade) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Trade not found'
                        }));
                        break;
                    }

                    if (trade.to !== playerId) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Not authorized to accept this trade'
                        }));
                        break;
                    }

                    const player1 = players.get(trade.from);
                    const player2 = players.get(trade.to);

                    if (!player1 || !player2) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Player offline'
                        }));
                        break;
                    }

                    // Validate items ownership
                    let valid = true;
                    for (const [petId, count] of Object.entries(trade.fromItems.pets || {})) {
                        if ((player1.inventory[petId] || 0) < count) {
                            valid = false;
                            break;
                        }
                    }
                    for (const [fruitId, count] of Object.entries(trade.fromItems.fruits || {})) {
                        if ((player1.fruits[fruitId] || 0) < count) {
                            valid = false;
                            break;
                        }
                    }
                    for (const [petId, count] of Object.entries(trade.toItems.pets || {})) {
                        if ((player2.inventory[petId] || 0) < count) {
                            valid = false;
                            break;
                        }
                    }
                    for (const [fruitId, count] of Object.entries(trade.toItems.fruits || {})) {
                        if ((player2.fruits[fruitId] || 0) < count) {
                            valid = false;
                            break;
                        }
                    }

                    if (!valid) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Invalid trade: items no longer available'
                        }));
                        trade.status = 'failed';
                        break;
                    }

                    // Execute trade
                    // Transfer from player1 to player2
                    for (const [petId, count] of Object.entries(trade.fromItems.pets || {})) {
                        player1.inventory[petId] = (player1.inventory[petId] || 0) - count;
                        if (player1.inventory[petId] <= 0) delete player1.inventory[petId];
                        player2.inventory[petId] = (player2.inventory[petId] || 0) + count;
                    }
                    for (const [fruitId, count] of Object.entries(trade.fromItems.fruits || {})) {
                        player1.fruits[fruitId] = (player1.fruits[fruitId] || 0) - count;
                        if (player1.fruits[fruitId] <= 0) delete player1.fruits[fruitId];
                        player2.fruits[fruitId] = (player2.fruits[fruitId] || 0) + count;
                    }
                    player1.coins -= (trade.fromItems.coins || 0);
                    player2.coins += (trade.fromItems.coins || 0);

                    // Transfer from player2 to player1
                    for (const [petId, count] of Object.entries(trade.toItems.pets || {})) {
                        player2.inventory[petId] = (player2.inventory[petId] || 0) - count;
                        if (player2.inventory[petId] <= 0) delete player2.inventory[petId];
                        player1.inventory[petId] = (player1.inventory[petId] || 0) + count;
                    }
                    for (const [fruitId, count] of Object.entries(trade.toItems.fruits || {})) {
                        player2.fruits[fruitId] = (player2.fruits[fruitId] || 0) - count;
                        if (player2.fruits[fruitId] <= 0) delete player2.fruits[fruitId];
                        player1.fruits[fruitId] = (player1.fruits[fruitId] || 0) + count;
                    }
                    player2.coins -= (trade.toItems.coins || 0);
                    player1.coins += (trade.toItems.coins || 0);

                    trade.status = 'completed';

                    // Notify both players
                    sendToPlayer(player1.id, {
                        type: 'tradeCompleted',
                        trade: {
                            id: trade.id,
                            newInventory: player1.inventory,
                            newFruits: player1.fruits,
                            newCoins: player1.coins
                        }
                    });
                    sendToPlayer(player2.id, {
                        type: 'tradeCompleted',
                        trade: {
                            id: trade.id,
                            newInventory: player2.inventory,
                            newFruits: player2.fruits,
                            newCoins: player2.coins
                        }
                    });
                    break;

                case 'declineTrade':
                    const declinedTrade = tradeOffers.get(msg.tradeId);
                    if (declinedTrade) {
                        declinedTrade.status = 'declined';
                        sendToPlayer(declinedTrade.from, {
                            type: 'tradeDeclined',
                            tradeId: msg.tradeId
                        });
                        ws.send(JSON.stringify({
                            type: 'tradeDeclined',
                            tradeId: msg.tradeId
                        }));
                    }
                    break;

                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });

    ws.on('close', () => {
        if (playerId && players.has(playerId)) {
            players.get(playerId).online = false;
            broadcast({
                type: 'playerOffline',
                playerId: playerId
            });
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// REST API endpoints
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        players: players.size,
        trades: tradeOffers.size,
        uptime: process.uptime()
    });
});

app.get('/api/players', (req, res) => {
    const playerList = Array.from(players.values()).map(p => ({
        id: p.id,
        username: p.username,
        online: p.online
    }));
    res.json({ players: playerList });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Start server
server.listen(PORT, () => {
    console.log(`🎮 BTF Trading Server running on port ${PORT}`);
    console.log(`   WebSocket: ws://localhost:${PORT}`);
    console.log(`   HTTP API: http://localhost:${PORT}`);
});

// Cleanup old trades every 5 minutes
setInterval(() => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    tradeOffers.forEach((trade, id) => {
        if (now - trade.timestamp > fiveMinutes && trade.status !== 'completed') {
            tradeOffers.delete(id);
        }
    });
}, 5 * 60 * 1000);
