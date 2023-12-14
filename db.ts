import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export class DB {
    constructor(private db: Database<sqlite3.Database, sqlite3.Statement>) { };

    public static async init() {
        const db = await open({
            filename: 'chat.db',
            driver: sqlite3.Database
        });

        await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_offset TEXT UNIQUE,
            content TEXT
        );
        `);

        return new DB(db);
    }

    public async insertMessage(msg: string) {
        return this.db.run('INSERT INTO messages (content) values (?)', msg)
    }

    public async eachMessage(id: number, callback: (err: any, row: any) => void) {
        return this.db.each('SELECT * FROM messages WHERE id > ?', id, callback)
    }
}
