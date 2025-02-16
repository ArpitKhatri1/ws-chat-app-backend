import { WebSocketServer, WebSocket } from "ws";

type UserType = {
  name: string;
  socket: WebSocket;
};
type AllRoomsType = {
  roomId: string;
  users: UserType[];
};

let allRooms: AllRoomsType[] = [];

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(socket: WebSocket) {
  socket.on("close", () => {
    console.log("close request");
    allRooms.map((room, index) => {
      room.users = room.users.filter((user) => user.socket !== socket);
      if (room.users.length === 0) {
        allRooms.splice(index, 1);
      }
    });
  });
  socket.on("message", (message) => {
    const msgString = message.toString();

    const msgObject = JSON.parse(msgString);
    console.log(msgObject);

    if (msgObject.type === "CREATE") {
      const roomId = msgObject.payload.roomId;
      allRooms.push({
        roomId: roomId,
        users: [],
      });
    }

    if (msgObject.type === "JOIN") {
      const roomId = msgObject.payload.roomId;
      const username = msgObject.payload.user;
      const room = allRooms.find((r) => r.roomId === roomId);

      if (room) {
        if (!room.users.some((user) => user.name === username)) {
          room.users.push({
            name: username,
            socket: socket,
          });
        }
      }
    }

    if (msgObject.type === "MESSAGE") {
      const roomId = msgObject.payload.roomId;
      const username = msgObject.payload.userName;
      const msgString = msgObject.payload.msgString;
      const room = allRooms.find((r) => r.roomId === roomId);

      const messagePayload = {
        msgString: msgString,
        userName: username,
      };
      console.log(messagePayload);
      if (room) {
        room.users.forEach((user) => {
          user.socket.send(JSON.stringify(messagePayload));
        });
      }
    }
  });
});

setInterval(() => {
  console.log("\n===== Current Active Rooms =====");
  if (allRooms.length === 0) {
    console.log("No active rooms.");
  } else {
    allRooms.forEach((room) => {
      console.log(`Room ID: ${room.roomId}`);
      console.log("Members:");
      if (room.users.length === 0) {
        console.log("  No users in this room.");
      } else {
        room.users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.name}`);
        });
      }
      console.log("-------------------------");
    });
  }
}, 3000);
