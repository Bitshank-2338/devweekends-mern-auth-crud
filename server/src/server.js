require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Render (and most hosts) inject their own PORT, so always read it from the
// environment and only fall back to 5000 for local development.
const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start listening. If the database is
// unreachable there is no point in accepting requests.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`DevBoard API listening on port ${PORT}`);
  });
});
