import BetterSqlite3 from 'better-sqlite3';

export class DuplicateMessageError extends Error {}

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

    public insertMessage(msg: string, clientOffset: string) {
        try {
            return this.db.prepare('INSERT INTO messages (content, client_offset) values (@content, @clientOffset)').run({content: msg, clientOffset});
        } catch (e) {
            if(e instanceof BetterSqlite3.SqliteError && e.code === 'SQLITE_CONSTRAINT_UNIQUE' ) {
                console.log('Duplicate message');
                throw new DuplicateMessageError();
            } else {
                throw e;
            }
        }
    }

    public getMessages(id: number) {
        return this.db.prepare('SELECT id, content FROM messages WHERE id > (@id)').all({'id': id});
    }
}
