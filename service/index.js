const express = require('express');
const cookieParser = require('cookie-parser');

const { verifyAuth } = require('./middleware/auth');

const app = express();

const port = process.argv[2] || process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve the production frontend.
app.use(express.static('public'));

// Mount API routes.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/entries', require('./routes/entries'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/research', require('./routes/research'));

// Protected profile endpoint.
app.get('/api/profile', verifyAuth, (req, res) => {
  res.send({
    username: req.user.username,
    email: req.user.email,
  });
});

// Unknown API endpoints return JSON.
app.use('/api', (_req, res) => {
  res.status(404).send({
    msg: 'API endpoint not found',
  });
});

// Error handler.
app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).send({
    msg: 'Internal server error',
  });
});

// React SPA fallback.
app.use((_req, res) => {
  res.sendFile('index.html', {
    root: 'public',
  });
});

// Start server.
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});