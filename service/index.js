
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');

const app = express();

const authCookieName = 'token';

// The backend must use port 4000.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Temporary in-memory application storage.
let users = [];
let favorites = [];
let entries = [];
let friends = [];

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve frontend files after deployment.
app.use(express.static('public'));

// API router
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Cookie configuration.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 1000 * 60 * 60 * 24,
};

apiRouter.post('/auth/create', async (req, res) => {
  const username = req.body.username?.trim().toLowerCase();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (
    !username ||
    !email ||
    !email.includes('@') ||
    !password ||
    username.length < 3 ||
    password.length < 6
  ) {
    return res.status(400).send({
      msg: 'Username, email, or password is invalid',
    });
  }

  if (await findUser('username', username)) {
    return res.status(409).send({
      msg: 'Username already exists',
    });
  }

  if (await findUser('email', email)) {
    return res.status(409).send({
      msg: 'Email already registered',
    });
  }

  const user = await createUser(username, email, password);

  setAuthCookie(res, user.token);

  res.status(201).send({
    username: user.username,
    email: user.email,
  });
});

// Login
apiRouter.post('/auth/login', async (req, res) => {
  const username = req.body.username?.trim().toLowerCase();
  const password = req.body.password;

  const user = await findUser('username', username);

  if (user && await bcrypt.compare(password, user.password)) {
    user.token = uuid.v4();

    setAuthCookie(res, user.token);

    return res.send({
      username: user.username,
      email: user.email,
    });
  }

  res.status(401).send({
    msg: 'Unauthorized',
  });
});


// Logout
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser(
    'token',
    req.cookies[authCookieName]
  );

  if (user) {
    delete user.token;
  }

  res.clearCookie(authCookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(204).end();
});

// Authentication middleware
const verifyAuth = async (req, res, next) => {
  const user = await findUser(
    'token',
    req.cookies[authCookieName]
  );

  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({
      msg: 'Unauthorized',
    });
  }
};


// Retrieve the authenticated user's friends.
apiRouter.get('/friends', verifyAuth, (req, res) => {
  const userFriends = friends.filter(
    (friend) => friend.owner === req.user.username
  );

  res.send(userFriends);
});

// Add a friend.
apiRouter.post('/friends', verifyAuth, (req, res) => {
  const username = req.body.username?.trim().replace(/^@/, '').toLowerCase();

  if (!username || username.length < 2) {
    return res.status(400).send({
      msg: 'Enter a valid username',
    });
  }

  if (username === req.user.username) {
    return res.status(400).send({
      msg: 'You cannot add yourself',
    });
  }

  const existing = friends.some(
    (friend) =>
      friend.owner === req.user.username &&
      friend.username === username
  );

  if (existing) {
    return res.status(409).send({
      msg: 'Friend already exists',
    });
  }

  const name = username
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const friend = {
    id: uuid.v4(),
    owner: req.user.username,
    username,
    name,
    status: 'pending',
  };

  friends.push(friend);

  res.status(201).send(friend);
});

// Accept a friend request.
apiRouter.patch('/friends/:id', verifyAuth, (req, res) => {
  const friend = friends.find(
    (item) =>
      item.id === req.params.id &&
      item.owner === req.user.username
  );

  if (!friend) {
    return res.status(404).send({
      msg: 'Friend request not found',
    });
  }

  friend.status = 'friend';

  res.send(friend);
});

// Remove a friend.
apiRouter.delete('/friends/:id', verifyAuth, (req, res) => {
  const index = friends.findIndex(
    (friend) =>
      friend.id === req.params.id &&
      friend.owner === req.user.username
  );

  if (index === -1) {
    return res.status(404).send({
      msg: 'Friend not found',
    });
  }

  friends.splice(index, 1);

  res.status(204).end();
});


// Retrieve health entries belonging to the authenticated user.
apiRouter.get('/entries', verifyAuth, (req, res) => {
  const userEntries = entries
    .filter((entry) => entry.username === req.user.username)
    .sort((a, b) => b.date.localeCompare(a.date));

  res.send(userEntries);
});

// Save a new health entry.
apiRouter.post('/entries', verifyAuth, (req, res) => {
  const { type, amount, date, notes } = req.body;

  const validTypes = ['sleep', 'exercise', 'nutrition'];

  if (
    !validTypes.includes(type) ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    (notes !== undefined && typeof notes !== 'string')
  ) {
    return res.status(400).send({
      msg: 'Invalid health entry',
    });
  }

  const entry = {
    id: uuid.v4(),
    username: req.user.username,
    date,
    type,
    amount,
    notes: (notes || '').trim().slice(0, 240),
  };

  entries.push(entry);

  res.status(201).send(entry);
});

// Delete a health entry.
apiRouter.delete('/entries/:id', verifyAuth, (req, res) => {
  const index = entries.findIndex(
    (entry) =>
      entry.id === req.params.id &&
      entry.username === req.user.username
  );

  if (index === -1) {
    return res.status(404).send({
      msg: 'Entry not found',
    });
  }

  entries.splice(index, 1);

  res.status(204).end();
});


// Protected profile endpoint
apiRouter.get('/profile', verifyAuth, (req, res) => {
  res.send({
    username: req.user.username,
    email: req.user.email,
  });
});

// Retrieve saved nutrition facts
apiRouter.get('/favorites', verifyAuth, (req, res) => {
  const userFavorites = favorites.filter(
    (favorite) => favorite.username === req.user.username
  );

  res.send(userFavorites);
});

// Save a nutrition fact
apiRouter.post('/favorites', verifyAuth, (req, res) => {
  const fact = req.body.fact?.trim();

  if (!fact) {
    return res.status(400).send({
      msg: 'Nutrition fact is required',
    });
  }

  const favorite = {
    id: uuid.v4(),
    username: req.user.username,
    fact,
    createdAt: new Date().toISOString(),
  };

  favorites.push(favorite);

  res.status(201).send(favorite);
});

// Delete a saved nutrition fact
apiRouter.delete('/favorites/:id', verifyAuth, (req, res) => {
  const index = favorites.findIndex(
    (favorite) =>
      favorite.id === req.params.id &&
      favorite.username === req.user.username
  );

  if (index === -1) {
    return res.status(404).send({
      msg: 'Favorite not found',
    });
  }

  favorites.splice(index, 1);

  res.status(204).end();
});

// Return JSON for unknown API endpoints.
app.use('/api', (_req, res) => {
  res.status(404).send({ msg: 'API endpoint not found' });
});

// Default error handler
app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).send({
    msg: 'Internal server error',
  });
});

// Serve the React application for other paths.
app.use((_req, res) => {
  res.sendFile('index.html', {
    root: 'public',
  });
});

// Create a user with a hashed password.
async function createUser(username, email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username,
    email,
    password: passwordHash,
    token: uuid.v4(),
  };

  users.push(user);

  return user;
}

// Find a user by username or authentication token.
async function findUser(field, value) {
  if (!value) return null;

  return users.find((user) => user[field] === value);
}

// Set the authentication cookie.
function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, cookieOptions);
}

// Start the server.
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
