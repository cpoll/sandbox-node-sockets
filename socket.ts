import { Server as HttpServer } from "http";
import { Server, ServerOptions } from "socket.io";
import { DB, DuplicateMessageError } from "./db";
import { randomInt } from "crypto";

/**
 * Serverside for socket connection
 * We pass all the messages to the client.
 * 
 * The client also sends us a "server offset" which lets us know the last message it's seen.
 * 
 * When we send to the client, we provide "lastInsertRowid", which is the count of the latest message.
 * TODO: Can there be a case where the client's last id is 4 but we send them 6, skipping 5?
 * 
 * This server doesn't try to reconcile race conditions between two clients. It's the source of truth, and the client should figure out what to do if its local state doesn't match server state.
 * 
 * @param server 
 */


export async function createSocketServer(server: HttpServer) {
    // const db = await DB.init();

    const options: Partial<ServerOptions> = {
        connectionStateRecovery: {}
    }
    const io = new Server(server, options);


    // Room state (this should be in a DB in the future)
    type Room = {
        address: string
        users: Array<number>
    }
    let rooms: { [id: string]: Room } = {};

    const createRoom = (address: string) => {
        const roomId = "ABCDEFGHJKLM"[randomInt(0, 12)] + "NOPRSTUXYZ"[randomInt(0, 10)] + randomInt(0, 10);
        rooms[roomId] = {
            'address': address,
            'users': []
        };

        return roomId;
    }

    io.on('connection', async (socket) => {
        console.log('a user connected');

        const playerId = randomInt(1, 1000000);

        //socket.emit('serverEvent', { 'type': 'hello' });

        socket.on('clientEvent', (event, callback) => {
            switch (event.type) {
                case 'startRoom':
                    const roomId = createRoom(event.address);
                    rooms[roomId].users.push(playerId);
                    callback({ 'roomId': roomId });
                    break;
                case 'joinRoom':
                    console.log('client trying to join', event);
                    if (rooms[event.roomId]) {
                        rooms[event.roomId].users.push(playerId);
                        callback({ 'roomId': event.roomId });
                    } else {
                        callback({ 'error': 'room not found' });
                    }
                default:
                    console.error('bad event:', event);
                    callback();
                    break;

            }
            // try {
            //     result = await db.insertMessage(msg, clientOffset);
            // } catch (e) {
            //     // If it's a duplicate, we still inform the client we recieved it, so they stop sending it.
            //     if (e instanceof DuplicateMessageError) {
            //         callback();
            //     } else {
            //         // Otherwise, don't send a callback; let the client retry.
            //         // TODO: Add client logic to do something if the last retry fails
            //     }
            //     return;
            // }

            // // Let all clients know about the new message. 
            // io.emit('chat message', msg, result.lastInsertRowid);
        });

        // Client disconnects
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        // Client connection state wasn't recovered during last reconnection
        // if (!socket.recovered) {
        //     // Send the client all the messages they haven't yet seen
        //     const messages: any = db.getMessages(socket.handshake.auth.serverOffset || 0);
        //     for (let message of messages) {
        //         socket.emit('chat message', message.content, message.id);
        //     }
        // }
    });
}
