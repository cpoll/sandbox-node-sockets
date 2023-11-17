import { Server as HttpServer } from "http";
import { Server } from "socket.io";

export function createSocketServer(server: HttpServer) {
    const io = new Server(server);
    io.on('connection', (socket) => {

        console.log('a user connected');

        socket.broadcast.emit('hi');

        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            io.emit('chat message', msg);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
}
