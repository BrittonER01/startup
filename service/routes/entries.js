const express = require('express');
const uuid = require('uuid');

const { entries } = require('../database');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();

// Retrieve health entries belonging to the authenticated user.
router.get('/', verifyAuth, (req, res) => {
  const userEntries = entries
    .filter((entry) => entry.username === req.user.username)
    .sort((a, b) => b.date.localeCompare(a.date));

  res.send(userEntries);
});

// Save a new health entry.
router.post('/', verifyAuth, (req, res) => {
  const { type, amount, date, notes } = req.body;

  const validTypes = ['sleep', 'exercise', 'nutrition'];

  const MAX_ENTRY_AMOUNTS = {
    sleep: 24,
    exercise: 1440,
    nutrition: 10000,
  };

  if (
    !validTypes.includes(type) ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > MAX_ENTRY_AMOUNTS[type] ||
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    (notes !== undefined && typeof notes !== 'string')
  ) {
    return res.status(400).send({
      msg: 'Invalid health entry amount or information',
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
router.delete('/:id', verifyAuth, (req, res) => {
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

module.exports = router;