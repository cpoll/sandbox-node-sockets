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
            io.emit('chat message', msg, result.lastID);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        if(!socket.recovered) {
            await db.eachMessage(socket.handshake.auth.serverOffset || 0, (_err, row) => {
                socket.emit('chat message', row.content, row.id);
            })
        }
    });
}
