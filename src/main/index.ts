import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import dotenv from "dotenv";
type UserType = {
  name: string;
  socket: WebSocket;
};

type AllRoomsType = {
  roomId: string;
  users: UserType[];
};
dotenv.config();
let allRooms: AllRoomsType[] = [];

// Create an HTTP server
const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (socket: WebSocket) => {
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
      if (
        room &&
        !room.users.some((user) => user.name === msgObject.payload.user)
      ) {
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
        room.users.forEach((user) =>
          user.socket.send(JSON.stringify(messagePayload))
        );
      }
    }
  });
});

// Bind to Render's assigned port
const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
