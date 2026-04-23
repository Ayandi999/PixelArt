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

io.on('connect', (socket) => {
     console.log('New User connected at port number:', socket.id);
     socket.on('color-update', (data) => {
          socket.broadcast.emit("change-is-here", data);
     })
})

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
     console.log(`server is running on port : ${PORT}`);
})