const express = require('express');
const uuid = require('uuid');

const DB = require('../database');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();

// Retrieve health entries belonging to the authenticated user.
router.get('/', verifyAuth, async (req, res) => {
  const userEntries = await DB.getEntries(req.user.username);
  res.send(userEntries);
});

// Save a new health entry.
router.post('/', verifyAuth, async (req, res) => {
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

  await DB.addEntry(entry);

  res.status(201).send(entry);
});

// Delete a health entry.
router.delete('/:id', verifyAuth, async (req, res) => {
  const result = await DB.deleteEntry(req.params.id, req.user.username);

  if (result.deletedCount === 0) {
    return res.status(404).send({
      msg: 'Entry not found',
    });
  }

  res.status(204).end();
});

module.exports = router;