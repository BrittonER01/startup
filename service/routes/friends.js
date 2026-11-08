const express = require('express');
const uuid = require('uuid');

const { friends } = require('../data/store');

const {
  verifyAuth,
  findUser,
} = require('../middleware/auth');

const router = express.Router();

// Retrieve the authenticated user's friends.
router.get('/', verifyAuth, (req, res) => {
  const userFriends = friends.filter(
    (friend) => friend.owner === req.user.username
  );

  res.send(userFriends);
});

// Add a friend.
router.post('/', verifyAuth, async (req, res) => {
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

  // Verify that the requested user has an account.
  const targetUser = await findUser('username', username);

  if (!targetUser) {
    return res.status(404).send({
      msg: 'User not found',
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

  const name = targetUser.displayName || targetUser.username;

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
router.patch('/:id', verifyAuth, (req, res) => {
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
router.delete('/:id', verifyAuth, (req, res) => {
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

module.exports = router;