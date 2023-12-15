import sqlite3 from 'sqlite3';
import BetterSqlite3 from 'better-sqlite3';

export class DB {
    constructor(private db: BetterSqlite3.Database) { };

    public static async init() {
        // const db = await open({
        //     filename: 'chat.db',
        //     driver: sqlite3.Database
        // });
        const db = new BetterSqlite3('chat.db', { verbose: console.log }); 

        await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_offset TEXT UNIQUE,
            content TEXT
        );
        `);

        return new DB(db);
    }

    public insertMessage(msg: string) {
        return this.db.prepare('INSERT INTO messages (content) values (@content)').run({content: msg});
    }

    public getMessages(id: number) {
        return this.db.prepare('SELECT id, content FROM messages WHERE id > (@id)').all({'id': id});
    }
}
