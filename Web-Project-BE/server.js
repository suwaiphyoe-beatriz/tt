const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const ingredientRoutes = require('./routes/ingredients');
const cartRoutes = require('./routes/cart');
const aiRoutes = require('./routes/ai');
require('./config/passport'); // Load passport config

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow only frontend origin
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json({ limit: '15mb' })); // Body parser for JSON with increased limit for image uploads (10MB image -> ~13.3MB base64)
app.use(express.urlencoded({ limit: '15mb', extended: true })); // Handle form data with increased limit
app.use(express.static('view')); // Serve static files from 'view'

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 minutes per IP
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Static file serving for images
app.use('/api/images', express.static(path.join(__dirname, 'public/images')));

// API Routes
app.use('/api/auth', authLimiter, authRoutes); // Authentication routes
app.use('/api/recipes', recipeRoutes); // Recipe routes
app.use('/api/ingredients', ingredientRoutes); // Ingredient routes
app.use('/api/cart', cartRoutes); // Cart routes
app.use('/api/ai', aiRoutes); // AI recommendation routes

app.use((req, res) => {
  res.sendFile(__dirname + '/view/index.html');
});

// 404 Handling
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
