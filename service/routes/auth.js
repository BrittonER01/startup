const express = require('express');
const bcrypt = require('bcryptjs');
const {
  findUser,
  createUser,
  startSession,
  endSession,
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

  startSession(res, user);

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

  if (
    user &&
    typeof password === 'string' &&
    await bcrypt.compare(password, user.password)
  ) {
    startSession(res, user);

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
  await endSession(req, res);

  res.status(204).end();
});

module.exports = router;