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

// 👇 Allow frontend (React Vite) to call backend
app.use(
  cors({
    origin: 'http://localhost:5173',               // frontend URL
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
  })
);

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
