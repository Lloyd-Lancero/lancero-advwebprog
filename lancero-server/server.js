require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productV1Routes = require('./routes/productV1Routes');
const authRoutes = require('./routes/authRoutes');

const { auditLoggerMiddleware } = require('./middleware/auditLoggerMiddleware');
const { apiLimiter } = require('./middleware/rateLimiterMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.set('trust proxy', 1);

// ---------------------------------------------------------------
// Middleware order matters - each request goes through them top to bottom:
//   1. helmet           security headers on every response (even errors)
//   2. cors             answers browser pre-flight (OPTIONS) requests
//   3. audit logger     starts its timer first so it sees EVERY request,
//                       including bad JSON and rate-limited (429) ones
//   4. express.json     reads the body (10kb max)
//   5. apiLimiter       global rate limit for /api
//   6. routes           (validation -> authentication -> authorization -> controller)
//   7. notFound / errorHandler   always last
// ---------------------------------------------------------------

// ---- Helmet (Part 5 of the activity) ----
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", 'data:'],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    frameguard: { action: 'sameorigin' },                            // X-Frame-Options: SAMEORIGIN
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }    // Referrer-Policy
}));

// ---- CORS (Part 6 of the activity) ----
// The ORIGIN is the website that calls the API = the React app (Vite runs on
// port 5173), NOT the API's own address (port 5000). Set CLIENT_URL in .env;
// use a comma to allow more than one, e.g. http://localhost:5173,https://myshop.com
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))   // origins never end with "/"
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // No Origin header = Postman, curl, server-to-server -> allowed
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const error = new Error('This origin is not allowed by CORS');
        error.code = 'CORS_NOT_ALLOWED';
        callback(error);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Accept', 'Content-Type', 'Authorization']
};

// app.use(cors(...)) also answers the OPTIONS pre-flight itself, so a separate
// app.options(...) line is not needed (and "app.options('*')" breaks in Express 5).
app.use(cors(corsOptions));

// ---- Audit logger (Parts 3 and 4) ----
app.use(auditLoggerMiddleware);

app.use(express.json({ limit: '10kb' }));

// ---- Global rate limit (Part 9) ----
app.use('/api', apiLimiter);

app.use('/api/product', productRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/v1/user', userRoutes); // same router, versioned path used in the Activity 4 test
app.use('/api/supplier', supplierRoutes);
app.use('/api/v1/products', productV1Routes);
app.use('/api/auth', authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.json({
        message: 'Bulldogs Exchange API is running'
    });
});

// Unknown route -> JSON 404, then the central error handler (must stay last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
