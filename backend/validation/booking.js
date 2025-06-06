import { z } from 'zod';

const createBookingSchema = z.object({
  projectId: z.string().length(24, 'Invalid project ID format'),
  startTime: z.coerce.date({ required_error: 'Start time is required' }),
  endTime: z.coerce.date({ required_error: 'End time is required' }),
  tags: z.array(z.string().length(24, 'Invalid tag ID format')).optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'endTime must be after startTime',
  path: ['endTime'],
});

const updateBookingSchema = z.object({
  projectId: z.string().length(24, 'Invalid project ID format').optional(),
  startTime: z.coerce.date({ required_error: 'Start time is required' }).optional(),
  endTime: z.coerce.date({ required_error: 'End time is required' }).optional(),
  tags: z.array(z.string().length(24, 'Invalid tag ID format')).optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'endTime must be after startTime',
  path: ['endTime'],
});

export { createBookingSchema, updateBookingSchema };