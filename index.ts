import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { createSocketServer } from './socket';
import { OverpassClient } from './overpass';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const app: Express = express();
    const server = createServer(app);
    const port = process.env.PORT;

    app.use('/site', express.static('public'));
    app.get('/health', (req: Request, res: Response) => {
        res.send('Express running');
    });

    // http://localhost:8000/restaurants?lat=43.676173&long=-79.358705
    app.get('/restaurants', async (req: Request, res: Response) => {
        const restaurants = await OverpassClient.getRestarauntsByGPS(req.query.lat as unknown as number, req.query.long as unknown as number);
        res.json(restaurants);
    });

    // Creates server at /socket.io/
    await createSocketServer(server);

    server.listen(port, () => {
        console.log(`Listening on ${port}`);
    });
}

main();
