"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let allRooms = [];
// Create an HTTP server
const server = http_1.default.createServer();
const wss = new ws_1.WebSocketServer({ server });
wss.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("close", () => {
        console.log("Client disconnected");
        allRooms = allRooms.filter((room) => {
            room.users = room.users.filter((user) => user.socket !== socket);
            return room.users.length > 0;
        });
    });
    socket.on("message", (message) => {
        const msgObject = JSON.parse(message.toString());
        console.log(msgObject);
        if (msgObject.type === "CREATE") {
            allRooms.push({ roomId: msgObject.payload.roomId, users: [] });
        }
        if (msgObject.type === "JOIN") {
            const room = allRooms.find((r) => r.roomId === msgObject.payload.roomId);
            if (room &&
                !room.users.some((user) => user.name === msgObject.payload.user)) {
                room.users.push({ name: msgObject.payload.user, socket });
            }
        }
        if (msgObject.type === "MESSAGE") {
            const room = allRooms.find((r) => r.roomId === msgObject.payload.roomId);
            if (room) {
                const messagePayload = {
                    msgString: msgObject.payload.msgString,
                    userName: msgObject.payload.userName,
                };
                room.users.forEach((user) => user.socket.send(JSON.stringify(messagePayload)));
            }
        }
    });
});
// Bind to Render's assigned port
const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
