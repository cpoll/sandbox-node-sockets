import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use('/site', express.static('public'));

app.get('/health', (req: Request, res: Response) => {
  res.send('Express running');
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

