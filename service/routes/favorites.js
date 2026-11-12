const express = require('express');
const uuid = require('uuid');

const DB = require('../database');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();

// Retrieve saved nutrition facts
router.get('/', verifyAuth, async (req, res) => {
  const userFavorites = await DB.getFavorites(req.user.username);
  res.send(userFavorites);
});

// Save a nutrition fact
router.post('/', verifyAuth, async (req, res) => {
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

  await DB.addFavorite(favorite);

  res.status(201).send(favorite);
});

// Delete a saved nutrition fact
router.delete('/:id', verifyAuth, async (req, res) => {
  const result = await DB.removeFavorite(req.params.id, req.user.username);

  if (result.deletedCount === 0) {
    return res.status(404).send({
      msg: 'Favorite not found',
    });
  }

  res.status(204).end();
});

module.exports = router;