import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { createSocketServer } from './socket';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const server = createServer(app);
const port = process.env.PORT;

app.use('/site', express.static('public'));
app.get('/health', (req: Request, res: Response) => {
  res.send('Express running');
});

// Creates server at /socket.io/
createSocketServer(server);

server.listen(port, () => {
  console.log(`Listening on ${port}`);
});

