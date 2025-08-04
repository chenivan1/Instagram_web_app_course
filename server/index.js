require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const addressesRoutes = require('./routes/addressesRoutes');
const path = require('path');

app.use(express.json());

// Serve static files from views directory for news assets
app.use('/assets', express.static(path.join(__dirname, 'views')));

app.use('/user', userRoutes);
app.use('/news', newsRoutes);
app.use('/addresses', addressesRoutes);

// Endpoint to get Google Maps API key
app.get('/api/maps-key', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Google Maps API key not configured' });
  }
  res.json({ apiKey });
});

// Serve HTML views
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login', 'login.html'));
});

app.get('/news', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'news', 'news.html'));
});

app.get('/addresses', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'addresses', 'addresses.html'));
});

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 