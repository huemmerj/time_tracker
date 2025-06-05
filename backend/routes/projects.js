import express from 'express';
import { collections } from '../db/mongo-client.js';
import { createProjectSchema, updateProjectSchema } from '../validation/project.js';
import { validateBody, validateParams, idParamsSchema } from '../middleware/validate.js';
import { ObjectId } from 'mongodb';
import {ApiResponse} from '../utils/api-response.js';
import asyncHandler from '../middleware/ascync-handler.js';
const router = express.Router();


// GET all projects
router.get('/', asyncHandler(async (req, res) => {
  const projects = await collections.projects().find().toArray();
  res.json(ApiResponse.success(projects, 'Projects retrieved successfully', 200));
}));

// GET a single project by ID
router.get('/:id', validateParams(idParamsSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await collections.projects().findOne({ _id: ObjectId.createFromHexString(id) });
  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }
  res.json(ApiResponse.success(project));
}));

// CREATE a new project
router.post('/', validateBody(createProjectSchema), asyncHandler(async (req, res) => {
  const result = await collections.projects().insertOne(req.body);
  res.status(201).json(ApiResponse.success(result, 'Project created successfully', 201));
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
      return res.status(404).json(ApiResponse.error('Project not found', 404));
    }

    res.status(200).json(ApiResponse.success(result, 'Project updated successfully', 200)); // return updated project including _id
  })
);

// DELETE a project
router.delete('/:id', validateParams(idParamsSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await collections.projects().deleteOne({ _id: ObjectId.createFromHexString(id) });
  if (result.deletedCount === 0) {
    return res.status(404).json(ApiResponse.error('Project not found', 404));
  }
  res.json(ApiResponse.success(null, 'Project deleted successfully', 200));
}));
export default router;