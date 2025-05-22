const express = require('express');
const { collections } = require('../db/mongo-client');
const { createProjectSchema, updateProjectSchema } = require('../validation/project');
const { validateBody, validateParams } = require('../middleware/validate');
const { z } = require('zod');
const { ObjectId } = require('mongodb');
const router = express.Router();

const idParamsSchema = z.object({
  id: z.string().length(24, 'Invalid ID format'),
})

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET all projects
router.get('/', asyncHandler(async (req, res) => {
  const projects = await collections.projects().find().toArray();
  res.json(projects);
}));

// GET a single project by ID
router.get('/:id', validateParams(idParamsSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await collections.projects().findOne({ _id: ObjectId.createFromHexString(id) });
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.json(project);
}));

// CREATE a new project
router.post('/', validateBody(createProjectSchema), asyncHandler(async (req, res) => {
  const { name, description, startTime, endTime } = req.body;
  const result = await collections.projects().insertOne({ name, description, startTime, endTime });
  res.status(201).json({
    _id: result.insertedId,
    name,
    description,
    startTime,
    endTime
  });
}));

// UPDATE an existing project
router.put(
  '/:id',
  validateParams(idParamsSchema),
  validateBody(updateProjectSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Filter out only defined fields
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v !== undefined)
    );

    const result = await collections.projects().findOneAndUpdate(
      { _id: ObjectId.createFromHexString(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(result); // return updated project including _id
  })
);

// DELETE a project
router.delete('/:id', validateParams(idParamsSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await collections.projects().deleteOne({ _id: ObjectId.createFromHexString(id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.json({ message: 'Project deleted successfully' });
}));

module.exports = router;