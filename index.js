import express, { json } from 'express'
import { Server } from 'socket.io'
import http from 'node:http'
import { join } from 'node:path'
import { publisher, subscriber, syncer } from './redis-connect.js'

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//Server everything inside public folder on connection
app.use(express.static('./public'))

//Redis: checkbox state key
const CURRENT_STATE = 'current-state'

//Server needs to subscribe to the channel to recive the update
subscriber.subscribe("server:color-update");


//Any message comes from Redis server enters here
subscriber.on('message', async (channel, message) => {
     //channel is what is the channel name, Message is the JSON data
     if (channel === 'server:color-update') {
          const data = JSON.parse(message);
          io.emit("change-is-here", data)
     }
})

io.on('connect', async (socket) => {
     console.log('New User connected at socket number:', socket.id);
     //Give him the current state of system
     // 1. Immediately send the new user the current state AFTER fetchign from redis
     let initialState = await syncer.get(CURRENT_STATE);
     initialState = initialState ? JSON.parse(initialState) : {};
     socket.emit('initial-state', initialState);

     //If any color change has appeared into the horizon
     socket.on('color-update', async (data) => {
          //Updating the state from redis
          const existingState = await syncer.get(CURRENT_STATE)
          if (existingState) {
               const state = JSON.parse(existingState);
               state[data.id] = data.color;
               syncer.set(CURRENT_STATE, JSON.stringify(state));
          } else {
               //If no set exist then make a new object and send her in
               const newState = {};
               syncer.set(CURRENT_STATE, JSON.stringify(newState))
          }
          //Publishing the data to redis server
          publisher.publish("server:color-update", JSON.stringify(data));

     })
})

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
     console.log(`server is running on port : ${PORT}`);
})