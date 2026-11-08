const express = require('express');
const uuid = require('uuid');

const { favorites } = require('../data/store');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();

// Retrieve saved nutrition facts
router.get('/', verifyAuth, (req, res) => {
  const userFavorites = favorites.filter(
    (favorite) => favorite.username === req.user.username
  );

  res.send(userFavorites);
});

// Save a nutrition fact
router.post('/', verifyAuth, (req, res) => {
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
router.delete('/:id', verifyAuth, (req, res) => {
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

module.exports = router;