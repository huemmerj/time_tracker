const { z } = require('zod');

const create bookingSchema = z.object({
  projectId: z.string().length(24, 'Invalid project ID format'),
  startTime: z.coerce.date({ required_error: 'Start time is required' }),
  endTime: z.coerce.date({ required_error: 'End time is required' }),
}).refine((data) => {
  // Check if endTime exists and is after startTime
  return !data.endTime || data.endTime > data.startTime;
}, {
  message: 'endTime must be after startTime',
