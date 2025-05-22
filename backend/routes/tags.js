const express = require('express');
const { collections } = require('../db/mongo-client');
const router = express.Router();

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET all tags
router.get('/', asyncHandler(async (req, res) => {
  const tags = await collections.tags().find().toArray();
  res.json(tags);
}));

// GET a single tag by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tag = await collections.tags().findOne({ _id: id }); // Assuming _id is the field name
  if (!tag) {
    return res.status(404).json({ message: 'Tag not found' });
  }
  res.json(tag);
}));

// CREATE a new tag
router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;
  const result = await collections.tags().insertOne({ name });
  res.status(201).json({
    _id: result.insertedId,
    name
  });
}));

// UPDATE an existing tag
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const result = await collections.tags().updateOne({ _id: id }, { $set: { name } });
  if (result.modifiedCount === 0) {
    return res.status(404).json({ message: 'Tag not found' });
  }
  res.json({ message: 'Tag updated successfully' });
}));

// DELETE a tag
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await collections.tags().deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Tag not found' });
  }
  res.json({ message: 'Tag deleted successfully' });
}));

module.exports = router;