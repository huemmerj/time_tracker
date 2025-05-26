import express from 'express';
import { collections } from '../db/mongo-client.js';
import { createProjectSchema, updateProjectSchema } from '../validation/project.js';
import { validateBody, validateParams, idParamsSchema } from '../middleware/validate.js';
import { ObjectId } from 'mongodb';

const router = express.Router();
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
  res.status(201).json(result);
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
export default router;