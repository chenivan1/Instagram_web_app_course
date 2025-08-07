require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { seedDatabase, isDatabaseEmpty } = require('./seedDatabase');
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

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Check if we should seed the database with mock data
  const SEED_DATABASE = process.env.SEED_DATABASE === 'true';
  const USE_DB = process.env.USE_DB === 'true';
  
  if (SEED_DATABASE && USE_DB) {
    try {
      console.log('🔍 Checking if database needs seeding...');
      const isEmpty = await isDatabaseEmpty();
      
      if (isEmpty) {
        console.log('📊 Database is empty, seeding with mock data...');
        const result = await seedDatabase(false); // Don't clear since it's already empty
        console.log('✅ Database seeded successfully:', result.summary);
      } else {
        console.log('📊 Database already contains data, skipping seeding.');
        console.log('💡 To force re-seeding, set FORCE_SEED=true in environment variables.');
      }
      
      // Force seeding if explicitly requested
      if (process.env.FORCE_SEED === 'true') {
        console.log('🔄 Force seeding requested, clearing and re-seeding database...');
        const result = await seedDatabase(true);
        console.log('✅ Database force-seeded successfully:', result.summary);
      }
      
    } catch (error) {
      console.error('❌ Failed to seed database:', error.message);
      console.log('⚠️  Server will continue running, but database may be empty.');
    }
  } else if (SEED_DATABASE && !USE_DB) {
    console.log('⚠️  SEED_DATABASE is enabled but USE_DB is false. Seeding only works with MongoDB.');
  }
}); 