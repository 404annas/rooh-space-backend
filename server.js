import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import { limiter } from './middlewares/rateLimitMiddleware.js';
import userRoutes from './routes/userRoutes.js';

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Apply rate limiting to all requests
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// CORS middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
    const startTime = Date.now();

    // Log incoming request
    console.log(`\x1b[36m${new Date().toISOString()}\x1b[0m \x1b[33m${req.method}\x1b[0m ${req.originalUrl}`);

    // Capture the original res.end method to log response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - startTime;
        console.log(`\x1b[36m${new Date().toISOString()}\x1b[0m \x1b[32m${res.statusCode}\x1b[0m ${req.originalUrl} \x1b[35m${duration}ms\x1b[0m`);

        // Call the original end method
        originalEnd.call(this, chunk, encoding);
    };

    next();
});

app.use("/api/users", userRoutes);

// Error handling middleware (should be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`\x1b[34mServer running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}\x1b[0m`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`\x1b[31mError: ${err.message}\x1b[0m`);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});