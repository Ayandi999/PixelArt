import Redis from 'ioredis'

const config = {
     host: 'localhost',
     port: 6379
}

//This syncker connection is for updating the state in redis server and readin the state from it when new server is coonected
export const syncer = new Redis(config);
export const publisher = new Redis(config);
export const subscriber = new Redis(config);