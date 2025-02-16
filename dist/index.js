"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let userCount = 0;
let allSockets = [];
wss.on("connection", (socket) => {
    // whenever there is a new connection to the websocket server , call this callback funciton
    // (socket) in callback represents the current connecton, each user will have its own unique connection represented by socket.
    allSockets.push(socket);
    userCount++;
    console.log("#" + userCount);
    socket.on("message", (msg) => {
        allSockets.forEach((childSocket) => {
            if (childSocket !== socket) {
                childSocket.send(msg.toString() + "cahgen this filed");
            }
        });
    });
});
