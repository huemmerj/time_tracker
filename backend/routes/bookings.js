import  express from 'express';
import { collections } from '../db/mongo-client.js';
import asyncHandler from '../middleware/ascync-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import { validateBody, validateParams, idParamsSchema } from '../middleware/validate.js';
import { createBookingSchema, updateBookingSchema } from '../validation/booking.js';
import { ObjectId } from 'mongodb';
const router = express.Router();


// GET all bookings
router.get('/', asyncHandler(async (req, res) => {
  const bookings = await collections.bookings().aggregate([
    {
      $lookup: {
        from: 'tags', // The name of the tags collection
        localField: 'tags', // The field in bookings that contains tag IDs
        foreignField: '_id', // The field in tags to match
        as: 'tags', // The name of the field to store the joined data
      },
      $lookup: {
        from: 'projects', // The name of the projects collection
        localField: 'projectId', // The field in bookings that contains project IDs
        foreignField: '_id', // The field in projects to match
        as: 'project', // The name of the field to store the joined data
      }
    },
  ]).toArray();

  res.json(ApiResponse.success(bookings, 'Bookings retrieved successfully', 200));
}));

// GET a single booking by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const bookingId = new ObjectId(req.params.id);

  const [booking] = await collections.bookings().aggregate([
    { $match: { _id: bookingId } },
    {
      $lookup: {
        from: 'tags',
        localField: 'tags',
        foreignField: '_id',
        as: 'tags'
      },
      $lookup: {
        from: 'projects',
        localField: 'projectId',
        foreignField: '_id',
        as: 'project'
      }
    },
  ]).toArray();

  if (!booking) {
    return res.status(404).json(ApiResponse.error('Booking not found', 404));
  }

  res.json(ApiResponse.success(booking, 'Booking retrieved successfully', 200));
}));
// CREATE a new booking
router.post('/', validateBody(createBookingSchema), asyncHandler(async (req, res) => {
  const { projectId, tags } = req.body;

  // Validate project ID
  const project = await collections.projects().findOne({ _id: ObjectId.createFromHexString(projectId) });
  if (!project) return res.status(404).json(ApiResponse.error('Project not found', 404));

  // Validate and convert tag IDs
  const tagIds = tags?.map(tagId => ObjectId.createFromHexString(tagId)) || [];
  const existingTags = await collections.tags().find({ _id: { $in: tagIds } }).toArray();
  if (existingTags.length !== tagIds.length) return res.status(404).json(ApiResponse.error('One or more tags not found', 404));

  // Insert booking
  const result = await collections.bookings().insertOne({ ...req.body, projectId: ObjectId.createFromHexString(projectId), tags: tagIds, projectId: ObjectId.createFromHexString(projectId) });
  res.status(201).json(ApiResponse.success(result, 'Booking created successfully', 201, { id: result.insertedId }));
}));
router.put(
  '/:id',
  validateParams(idParamsSchema),
  validateBody(updateBookingSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Filter out only defined fields
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v !== undefined)
    );
    // Check if a project with the given ID exists
    if (updateData.projectId) {
      let project = await collections.projects().findOne({ _id: ObjectId.createFromHexString(updateData.projectId) });
      if (!project) {
        return res.status(404).json(ApiResponse.error('Project not found', 404));
      }
    }

    // Check if a tag with the given ID exists
    if (updateData.tags && updateData.tags.length > 0) {
      for (const tagId of updateData.tags) {
        const tag = await collections.tags().findOne({ _id: ObjectId.createFromHexString(tagId) });
        if (!tag) {
          return res.status(404).json(ApiResponse.error(`Tag with ID ${tagId} not found`, 404));
        }
      }
    }

    const result = await collections.bookings().findOneAndUpdate(
      { _id: ObjectId.createFromHexString(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json(ApiResponse.error('Booking not found', 404));
    }

    res.status(200).json(ApiResponse.success(result, 'Booking updated successfully', 200)); // return updated booking including _id
  })
);

// DELETE a booking
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await collections.bookings().deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    return res.status(404).json(ApiResponse.error('Booking not found', 404));
  }
  res.json(ApiResponse.success(null, 'Booking deleted successfully', 200));
}));

export default router;