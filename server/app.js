const express = require('express');
const http = require('http');
const {
    Server
} = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

const onlineUsers = [];

io.on("connection", socket => {
    socket.on("Message", (message, senderID, receiverID, time, isSeen) => {
        socket.to(receiverID).emit("receiveMessage", message, senderID, receiverID, time, isSeen);
    });
    socket.on("SendSeenInfo", (senderID, receiverID) => {
        socket.to(receiverID).emit("SeenInfo", senderID)
    })
    socket.on("OnlineUser", (username, socketID, avatar, hasSeenYou) => {
        onlineUsers.push({username, userID : socketID , avatar, hasSeenYou});
        io.emit("setOnlineUsers", onlineUsers);
    })
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});