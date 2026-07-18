import { connectDatabase } from './database/mongodb';
import { PORT } from './config';
import dotenv from 'dotenv';
import app from './app';

dotenv.config();

async function startServer() {
    await connectDatabase();
    app.listen(PORT, () => {
        console.log(`Server: http://localhost:${PORT}`);
    });
}

startServer();