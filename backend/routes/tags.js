import  express from 'express';
import { collections } from '../db/mongo-client.js';
import asyncHandler from '../middleware/ascync-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import { validateBody, validateParams } from '../middleware/validate.js';

import { ObjectId } from 'mongodb';
const router = express.Router();


// GET all tags
router.get('/', asyncHandler(async (req, res) => {
  const tags = await collections.tags().find().toArray();
  res.json(ApiResponse.success(tags, 'Tags retrieved successfully', 200));
}));

// GET a single tag by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tag = await collections.tags().findOne({ _id: ObjectId.createFromHexString(id) }); // Assuming _id is the field name
  if (!tag) {
    return res.status(404).json(ApiResponse.error('Tag not found', 404));
  }
  res.json(ApiResponse.success(tag, 'Tag retrieved successfully', 200));
}));

// CREATE a new tag
router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;
  const result = await collections.tags().insertOne({ name });
  res.status(201).json(ApiResponse.success(result, 'Tag created successfully', 201, { id: result.insertedId }));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Filter out only defined fields
  const updateData = Object.fromEntries(
    Object.entries(req.body).filter(([_, v]) => v !== undefined)
  );

  const result = await collections.tags().findOneAndUpdate(
    { _id: ObjectId.createFromHexString(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result.value) {
    return res.status(404).json(ApiResponse.error('Tag not found', 404));
  }

  res.status(200).json(ApiResponse.success(result.value, 'Tag updated successfully', 200));
}));

// DELETE a tag
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await collections.tags().deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    return res.status(404).json(ApiResponse.error('Tag not found', 404));
  }
  res.json(ApiResponse.success(null, 'Tag deleted successfully', 200));
}));

export default router;