// Load environment variables from .env
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors');  // 👈 added

const app = express();

// Middleware to read JSON + cookies
app.use(express.json());
app.use(cookieParser());

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Security Middlewares
app.use(helmet());
// app.use(mongoSanitize());

// 👇 Allow frontend (React Vite) to call backend dynamically
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,               // frontend URL from env or fallback
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
  })
);

// Basic Rate limiter: max 100 requests per 15 minutes per IP
const windowMs = 15 * 60 * 1000;
const limiter = rateLimit({
  windowMs: windowMs,
  max: 100, 
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
});
app.use(limiter);

// Connect to MongoDB
connectDB();

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/marketplace', require('./routes/marketplace'));
app.use('/lostfound', require('./routes/lostfound'));
app.use('/hackathon', require('./routes/hackathon'));

app.get('/', (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
