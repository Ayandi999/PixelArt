import express from 'express'
import { Server } from 'socket.io'
import http from 'node:http'
import { join } from 'node:path'

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
     res.sendFile(join(import.meta.dirname, 'index.html'));
})

app.get('/style.css', (req, res) => {
     res.sendFile(join(import.meta.dirname, 'style.css'));
})

app.get('/favicon.png', (req, res) => {
     res.sendFile(join(import.meta.dirname, 'favicon.png'));
})

// This object stays in the server's memory 24/7!
const boardState = {};

io.on('connect', (socket) => {
     console.log('New User connected at port number:', socket.id);
     
     // 1. Immediately send the new user the CURRENT state of the board
     socket.emit('initial-state', boardState);

     socket.on('color-update', (data) => {
          // 2. Remember this change in the server's memory
          boardState[data.id] = data.color;
          
          // 3. Broadcast the change to everyone else
          socket.broadcast.emit("change-is-here", data);
     })
})

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
     console.log(`server is running on port : ${PORT}`);
})