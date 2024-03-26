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
    socket.on("Message", (message, senderID, receiverID) => {
        socket.to(receiverID).emit("receiveMessage", message, senderID, receiverID);
    });
    socket.on("OnlineUser", (username, socketID, avatar) => {
        onlineUsers.push({username, userID : socketID , avatar});
        io.emit("setOnlineUsers", onlineUsers);
    })
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});