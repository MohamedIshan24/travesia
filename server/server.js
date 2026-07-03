const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path);
  next();
});

app.get('/api', (req, res) => {
  res.json({ message: 'Travesía API is running' });
});

app.use('/api/places', require('./routes/placeRoutes'));
app.use('/api/places', require('./routes/essayRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR HANDLER:', err.stack);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));