import express from 'express';
import { collections } from '../db/mongo-client.js';
import { validateBody, validateParams, idParamsSchema } from '../middleware/validate.js';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { createBookingSchema, updateBookingSchema } from '../validation/booking.js';

const router = express.Router();

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


router.get('/', asyncHandler(async (req, res) => {
  const bookings = await collections.bookings().find().toArray();
  res.json(bookings);
}
));

router.get('/:id', validateParams(idParamsSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await collections.bookings().findOne({ _id: ObjectId.createFromHexString(id) });
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  res.json(booking);
}));

router.post('/', validateBody(createBookingSchema), asyncHandler(async (req, res) => {
  const result = await collections.bookings().insertOne(req.body);
  res.status(201).json({
    _id: result.insertedId,
    ...req.body
  })
}));


export default router;