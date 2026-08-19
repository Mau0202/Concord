const path = require('path');
const http = require('http');
const express = require('express');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const rooms = new Map();

function id() { return Math.random().toString(36).slice(2, 10); }
function safeSend(socket, message) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}
function broadcast(room, message, except) {
  for (const client of room.values()) if (client !== except) safeSend(client, message);
}
function leave(socket) {
  if (!socket.room) return;
  const room = rooms.get(socket.room);
  if (room) {
    room.delete(socket.id);
    broadcast(room, { type: 'peer-left', peerId: socket.id, name: socket.name }, socket);
    if (!room.size) rooms.delete(socket.room);
  }
  socket.room = null;
}

wss.on('connection', (socket) => {
  socket.id = id();
  socket.on('message', (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch { return; }
    if (data.type === 'join') {
      leave(socket);
      const roomId = String(data.room || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 32);
      const name = String(data.name || 'Convidado').slice(0, 30);
      if (!roomId) return safeSend(socket, { type: 'error', message: 'Código da sala inválido.' });
      const room = rooms.get(roomId) || new Map();
      if (room.size >= 12) return safeSend(socket, { type: 'error', message: 'Esta sala já está cheia.' });
      const peers = [...room.entries()].map(([peerId, peer]) => ({ peerId, name: peer.name }));
      rooms.set(roomId, room); room.set(socket.id, socket);
      socket.room = roomId; socket.name = name;
      safeSend(socket, { type: 'welcome', peerId: socket.id, peers });
      broadcast(room, { type: 'peer-joined', peerId: socket.id, name }, socket);
    }
    if (data.type === 'signal' && socket.room && data.to) {
      const peer = rooms.get(socket.room)?.get(data.to);
      if (peer) safeSend(peer, { type: 'signal', from: socket.id, payload: data.payload });
    }
    if (data.type === 'chat' && socket.room) {
      const text = String(data.text || '').trim().slice(0, 1000);
      if (text) broadcast(rooms.get(socket.room), { type: 'chat', from: socket.id, name: socket.name, text, at: Date.now() });
    }
  });
  socket.on('close', () => leave(socket));
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Telao em http://localhost:${port}`));
