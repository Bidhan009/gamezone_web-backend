import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import adminRoutes from './routes/admin/admin.route';
import productRoutes from './routes/product.route';
import userRoutes from './routes/user.route';
import cartRoutes from './routes/cart.route';
import orderRoutes from './routes/order.route';
import { generalLimiter } from "./middleware/rate-limit.middleware";

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
app.use(generalLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint for testing
app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: "true", message: "Welcome to API" });
});

export default app;
