import { Server as HttpServer } from "http";
import { Server, ServerOptions } from "socket.io";
import { DB } from "./db";

export async function createSocketServer(server: HttpServer) {
    const db = await DB.init();

    const options: Partial<ServerOptions> = {
        connectionStateRecovery: {}
    }
    const io = new Server(server, options);
    io.on('connection', async (socket) => {
        socket.on('chat message', async (msg) => {
            const result = await db.insertMessage(msg);
            io.emit('chat message', msg, result.lastInsertRowid);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        if(!socket.recovered) {
            const messages: any = db.getMessages(socket.handshake.auth.serverOffset || 0);
            for (let message of messages) {
                socket.emit('chat message', message.content, message.id);
            }
        }
    });
}
