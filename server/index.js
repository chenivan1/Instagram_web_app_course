const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use('/user', userRoutes);

app.get('/', (_, res) => {
  res.send('Hello from Express server!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 