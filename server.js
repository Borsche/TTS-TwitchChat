import express from "express";
import fs from "fs";
import { WebSocketServer } from "ws";

export default class Server {

    #wss = null;
    #eventHandler = [];

    constructor() {
        const expressApp = express();

        expressApp.use(express.static('public'));

        expressApp.listen(3000, () => {
            console.log('Server is running on port 3000');
        });

        this.#wss = new WebSocketServer({ port: 3001 });

        this.#wss.on('connection', (ws) => {
            ws.on('error', console.error);

            // ws.on('message', (message) => {
            //     const msg = JSON.parse(message);
            //     const func = this.#eventHandler[msg.event]
            //     if(func) func(this, msg.data);
            // });

            // ws.send(JSON.stringify({ event: 'connected', data: {} }));
        });
    }

    on(event, callback) {
        this.#eventHandler[event] = callback;
    }

    sendAll(msg) {
        this.#wss.clients.forEach(client => {
            client.send(msg);
        });
    }

} 