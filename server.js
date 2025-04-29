const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // 允许所有来源
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

let rooms = {};

io.on("connection", (socket) => {
    console.log("用户已连接:", socket.id);

    socket.on("createRoom", (_, callback) => {
        const roomId = `room-${Math.random().toString(36).substr(2, 9)}`;
        rooms[roomId] = { players: [socket.id] };
        socket.join(roomId);
        console.log(`房间已创建: ${roomId}`);
        callback({ success: true, roomId });
    });

    socket.on("joinRoom", ({ roomId }, callback) => {
        if (rooms[roomId] && rooms[roomId].players.length < 2) {
            rooms[roomId].players.push(socket.id);
            socket.join(roomId);
            console.log(`用户加入房间: ${roomId}`);
            io.to(roomId).emit("playerJoined");
            callback({ success: true });
        } else {
            callback({ success: false, message: "房间不存在或已满员" });
        }
    });

    socket.on("makeMove", (data) => {
        io.to(data.roomId).emit("updateBoard", data);
    });

    socket.on("gameOver", (data) => {
        io.to(data.roomId).emit("gameOver", data);
    });

    socket.on("restartGame", ({ roomId }) => {
        io.to(roomId).emit("restartGame");
    });

    socket.on("leaveRoom", ({ roomId }) => {
        if (rooms[roomId]) {
            rooms[roomId].players = rooms[roomId].players.filter((id) => id !== socket.id);
            if (rooms[roomId].players.length === 0) {
                delete rooms[roomId];
            }
        }
        socket.leave(roomId);
        io.to(roomId).emit("playerLeft");
    });

    socket.on("disconnect", () => {
        console.log("用户已断开:", socket.id);
        for (const roomId in rooms) {
            if (rooms[roomId].players.includes(socket.id)) {
                rooms[roomId].players = rooms[roomId].players.filter((id) => id !== socket.id);
                if (rooms[roomId].players.length === 0) {
                    delete rooms[roomId];
                } else {
                    io.to(roomId).emit("playerLeft");
                }
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`服务器正在运行，端口: ${PORT}`);
});
