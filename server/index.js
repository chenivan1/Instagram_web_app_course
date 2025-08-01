const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const path = require('path');

app.use(express.json());

// Serve static files from views directory for news assets
app.use('/assets', express.static(path.join(__dirname, 'views')));

app.use('/user', userRoutes);
app.use('/news', newsRoutes);

app.get('/', (_, res) => {
  res.send('Hello from Express server!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 