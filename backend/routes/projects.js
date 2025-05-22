const express = require('express');
const { ObjectId } = require('mongodb');
const { collections } = require('../db/mongo-client');
const router = express.Router();

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// GET all projects
router.get('/', asyncHandler(async (req, res) => {
  const projects = await collections.projects().find().toArray();
  res.json(projects);
}));

// GET a single project by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await collections.projects().findOne({ _id: new ObjectId(id) });
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.json(project);
}));

// CREATE a new project
router.post('/', asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  const result = await collections.projects().insertOne({ name, description });
  res.status(201).json({
    _id: result.insertedId,
    name,
    description
  });
}));

// UPDATE an existing project
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const result = await collections.projects().updateOne(
    { _id: new ObjectId(id) },
    { $set: { name, description } }
  );
  if (result.modifiedCount === 0) {
    return res.status(404).json({ message: 'Project not found or not modified' });
  }
  res.json({ message: 'Project updated successfully' });
}));

// DELETE a project
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await collections.projects().deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.json({ message: 'Project deleted successfully' });
}));

module.exports = router;
