const express = require('express');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const {
  authCookieName,
  findUser,
  createUser,
  setAuthCookie,
} = require('../middleware/auth');

const router = express.Router();

router.post('/create', async (req, res) => {
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
router.post('/login', async (req, res) => {
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
router.delete('/logout', async (req, res) => {
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

module.exports = router;