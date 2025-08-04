require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const addressesRoutes = require('./routes/addressesRoutes');
const communityRoutes = require('./routes/communityRoutes');
const postRoutes = require('./routes/postRoutes');
const feedRoutes = require('./routes/feedRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const path = require('path');

app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images

// Serve static files from views directory for news assets
app.use('/assets', express.static(path.join(__dirname, 'views')));

// Existing routes
app.use('/user', userRoutes);
app.use('/news', newsRoutes);
app.use('/addresses', addressesRoutes);

// New community features routes
app.use('/communities', communityRoutes);
app.use('/posts', postRoutes);
app.use('/feed', feedRoutes);
app.use('/subscriptions', subscriptionRoutes);

// Endpoint to get Google Maps API key
app.get('/api/maps-key', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Google Maps API key not configured' });
  }
  res.json({ apiKey });
});

// Serve HTML views
app.get('/login', authMiddleware.redirectIfAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login', 'login.html'));
});

app.get('/register', authMiddleware.redirectIfAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register', 'registration.html'));
});

app.get('/home', authMiddleware.requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home', 'home.html'));
});

app.get('/news', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'news', 'news.html'));
});

app.get('/addresses', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'addresses', 'addresses.html'));
});

app.get('/communities-management', authMiddleware.requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'communities', 'communities.html'));
});

app.get('/posts-creation', authMiddleware.requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'posts', 'create-post.html'));
});

app.get('/', (req, res) => {
  const SessionManager = require('./sessionManager');
  if (SessionManager.isUserLoggedIn()) {
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 