import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { connectDatabase } from './database/mongodb';
import { PORT } from './config';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.route";
import cors from 'cors';

dotenv.config();
console.log(process.env.PORT);

import adminRoutes from './routes/admin/admin.route';
import productRoutes from './routes/product.route';

const app: Application = express();

const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:8080"],  // Flutter web default port
    credentials: true,                // allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/admin/users', adminRoutes)
app.use('/api/products', productRoutes);

app.use('/api/auth', authRoutes);
app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: "true", message: "Welcome to the API" });
});

async function startServer() {
    await connectDatabase();

    app.listen(
        PORT,
        () => {
            console.log(`Server: http://localhost:${PORT}`);
        }
    );
}

startServer();