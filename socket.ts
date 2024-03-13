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
        users: Array<string>
    }
    let rooms: { [id: string]: Room } = {};

    const createRoom = (address: string) => {
        const roomId = "ABCDEFGHJKLM"[randomInt(0, 12)] + "NOPRSTUXYZ"[randomInt(0, 10)] + randomInt(0, 10);
        const room = {
            'address': address,
            'users': []
        };

        // Get all restaurants near the address
        //room.restaurants = await OverpassClient.getRestarauntsByGPS(address.lat, address.long);

        rooms[roomId] = room;

        return roomId;
    }

    const registerVote = () => {
        // TODO: add the vote to the list

        // If the vote lead to a pick, return that pick. Otherwise return false.
    }

    const getVotingOption = (userId: string) => {
        // Find an option for the player to vote on
    }

    io.on('connection', async (socket) => {
        console.log('a user connected');

        const userId = "Player" + randomInt(1, 1000000);

        //socket.emit('serverEvent', { 'type': 'hello' });

        socket.on('clientEvent', (event, callback) => {
            switch (event.type) {
                case 'startRoom':
                    const roomId = createRoom(event.address);
                    rooms[roomId].users.push(userId);
                    callback({ 'roomId': roomId });

                    // TODO: Send them something to vote on

                    break;
                case 'joinRoom':
                    if (rooms[event.roomId]) {
                        rooms[event.roomId].users.push(userId);
                        callback({ 'roomId': event.roomId });
                        io.emit('serverEvent', { 'type': 'userJoined', 'roomId': event.roomId, 'users': rooms[event.roomId].users });
                    } else {
                        callback({ 'error': 'room not found' });
                    }

                    // TODO: Send them something to vote on

                    break
                case 'vote':
                    // TODO: Register the vote and send them a new vote
                    break;
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
