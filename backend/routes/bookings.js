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
  const bookings = await collections.bookings().find().toArray();
  res.json(ApiResponse.success(bookings, 'Bookings retrieved successfully', 200));
}));

// GET a single booking by ID
router.get('/:id', validateParams(idParamsSchema),asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await collections.bookings().findOne({ _id: ObjectId.createFromHexString(id) }); // Assuming _id is the field name
  if (!booking) {
    return res.status(404).json(ApiResponse.error('Booking not found', 404));
  }
  res.json(ApiResponse.success(booking, 'Booking retrieved successfully', 200));
}));

// CREATE a new booking
router.post('/', validateBody(createBookingSchema),asyncHandler(async (req, res) => {
  const result = await collections.bookings().insertOne(req.body);
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