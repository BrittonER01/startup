const express = require('express');
const uuid = require('uuid');

const DB = require('../database');
const { verifyAuth, findUser } = require('../middleware/auth');

const router = express.Router();

// Retrieve the authenticated user's friends.
router.get('/', verifyAuth, async (req, res) => {
  const userFriends = await DB.getFriends(req.user.username);
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

  const existing = await DB.getFriendByUsername(req.user.username, username);

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

  await DB.addFriend(friend);

  res.status(201).send(friend);
});

// Accept a friend request.
router.patch('/:id', verifyAuth, async (req, res) => {
  const updatedFriend = await DB.acceptFriend(req.params.id, req.user.username);

  if (!updatedFriend) {
    return res.status(404).send({
      msg: 'Friend request not found',
    });
  }

  res.send(updatedFriend);
});

// Remove a friend.
router.delete('/:id', verifyAuth, async (req, res) => {
  const result = await DB.removeFriend(req.params.id, req.user.username);

  if (result.deletedCount === 0) {
    return res.status(404).send({
      msg: 'Friend not found',
    });
  }

  res.status(204).end();
});

module.exports = router;