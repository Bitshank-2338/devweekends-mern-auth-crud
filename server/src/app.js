const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notFound = require('./middleware/notFoundMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// The React app is served from a different origin (a different port in
// development, a different domain in production), so the browser needs this
// API to say which origins are allowed to call it.
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));

// Parses JSON request bodies into req.body
app.use(express.json());

// A plain health check, handy after deploying to confirm the API is awake.
app.get('/', (req, res) => {
  res.status(200).json({ message: 'DevBoard API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Reached only when no route above matched the request.
app.use(notFound);

// Reached whenever a route or middleware passed an error to next().
app.use(errorHandler);

module.exports = app;
