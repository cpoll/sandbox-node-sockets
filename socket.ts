import { Server as HttpServer } from "http";
import { Server, ServerOptions } from "socket.io";
import { DB, DuplicateMessageError } from "./db";

export async function createSocketServer(server: HttpServer) {
    const db = await DB.init();

    const options: Partial<ServerOptions> = {
        connectionStateRecovery: {}
    }
    const io = new Server(server, options);
    io.on('connection', async (socket) => {
        socket.on('chat message', async (msg, clientOffset, callback) => {
            let result;
            try {
                result = await db.insertMessage(msg, clientOffset);
            } catch (e) {
                if(e instanceof DuplicateMessageError) {
                    // If it's a duplicate, we still inform the client we recieved it, so they stop sending it.
                    callback();
                }

                // Don't send a callback; let the client retry.
                // TODO: Add client logic to do something if the last retry fails
                return;
            }

            io.emit('chat message', msg, result.lastInsertRowid);
            callback(); // Acknowledge the event
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
