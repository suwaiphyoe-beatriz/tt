const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

dotenv.config();

// initialize passport strategies (does not start sessions)
require('./config/passport');

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const ingredientRoutes = require('./routes/ingredients');
const cartRoutes = require('./routes/cart');
const aiRoutes = require('./routes/ai');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
	origin: process.env.FRONTEND_URL,
	credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Session middleware for Passport (tests can bypass sessions if needed)
app.use(session({
	secret: process.env.SESSION_SECRET || 'supersecretkey',
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({
		mongoUrl: process.env.MONGODB_URI,
		collectionName: 'sessions',
		ttl: 14 * 24 * 60 * 60
	}),
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 7,
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		sameSite: 'lax'
	}
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiter for auth routes
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: 'Too many requests from this IP, please try again after 15 minutes',
	standardHeaders: true,
	legacyHeaders: false,
});

// Health check
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'OK',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development'
	});
});

// Static images
app.use('/api/images', express.static(path.join(__dirname, 'public/images')));

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/ai', aiRoutes);

// 404
app.use('*', (req, res) => {
	res.status(404).json({ message: 'Route not found', code: 'ROUTE_NOT_FOUND' });
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.statusCode || 500).json({
		message: err.message || 'Internal Server Error',
		code: err.code || 'SERVER_ERROR'
	});
});

module.exports = app;
