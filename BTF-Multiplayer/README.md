# BTF Trading Server

Real-time multiplayer trading server for BTF Vibe Edition.

## Quick Start

```powershell
npm install
npm start
```

Server will run on `http://localhost:3000`

## Scripts

- `npm start` - Start the server
- `npm run dev` - Start with auto-reload (requires nodemon)

## Environment Variables

- `PORT` - Server port (default: 3000)

Example:
```powershell
$env:PORT=8080; npm start
```

## Features

- ✅ Real-time WebSocket connections
- ✅ Player presence tracking
- ✅ Trade proposals and acceptance
- ✅ Atomic item transfers
- ✅ Auto-cleanup of expired trades
- ✅ CORS enabled for local development

## Architecture

- **Express** - HTTP server and REST API
- **ws** - WebSocket server for real-time communication
- **cors** - Cross-origin resource sharing

## API Endpoints

### GET /api/status
Returns server statistics:
```json
{
  "status": "online",
  "players": 5,
  "trades": 2,
  "uptime": 12345.67
}
```

### GET /api/players
Returns list of all players:
```json
{
  "players": [
    { "id": "abc123", "username": "Player_abc", "online": true },
    { "id": "def456", "username": "Player_def", "online": false }
  ]
}
```

### GET /health
Health check endpoint:
```json
{ "status": "OK" }
```

## WebSocket Protocol

### Client → Server

**Register:**
```json
{
  "type": "register",
  "playerId": "optional_id",
  "username": "PlayerName",
  "coins": 1000,
  "inventory": { "pet_c_1": 5 },
  "fruits": { "fruit_r_1": 3 }
}
```

**Get Players:**
```json
{ "type": "getPlayers" }
```

**Propose Trade:**
```json
{
  "type": "proposeTrade",
  "toPlayerId": "target_player_id",
  "fromItems": {
    "pets": { "pet_c_1": 2 },
    "fruits": { "fruit_r_1": 1 },
    "coins": 500
  },
  "toItems": {
    "pets": {},
    "fruits": {},
    "coins": 0
  }
}
```

**Accept Trade:**
```json
{
  "type": "acceptTrade",
  "tradeId": "trade_id"
}
```

**Decline Trade:**
```json
{
  "type": "declineTrade",
  "tradeId": "trade_id"
}
```

### Server → Client

**Registered:**
```json
{
  "type": "registered",
  "playerId": "abc123",
  "message": "Connected to BTF Trading Server"
}
```

**Player List:**
```json
{
  "type": "playerList",
  "players": [
    { "id": "abc123", "username": "Player_abc" }
  ]
}
```

**Trade Received:**
```json
{
  "type": "tradeReceived",
  "trade": {
    "id": "trade123",
    "from": { "id": "abc123", "username": "Player_abc" },
    "fromItems": { "pets": { "pet_c_1": 2 }, "fruits": {}, "coins": 0 },
    "toItems": { "pets": {}, "fruits": {}, "coins": 0 }
  }
}
```

**Trade Completed:**
```json
{
  "type": "tradeCompleted",
  "trade": {
    "id": "trade123",
    "newInventory": { "pet_c_1": 3 },
    "newFruits": { "fruit_r_1": 2 },
    "newCoins": 1500
  }
}
```

**Error:**
```json
{
  "type": "error",
  "message": "Error description"
}
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start server.js --name btf-trading
   pm2 save
   pm2 startup
   ```
3. Configure reverse proxy (nginx/Apache) for WebSocket support
4. Use WSS (secure WebSocket) with SSL certificate
5. Consider using a database instead of in-memory storage

## Security Notes

⚠️ **Current Implementation:**
- Uses in-memory storage (data lost on restart)
- No authentication or rate limiting
- Suitable for local/LAN play only

🔒 **For Production:**
- Add user authentication (JWT tokens)
- Implement rate limiting
- Use persistent database (MongoDB, PostgreSQL)
- Add trade history logging
- Validate all trades server-side
- Add anti-cheat measures

## Support

Issues? Check the main README.md or contact: lawrencetong1030@gmail.com
