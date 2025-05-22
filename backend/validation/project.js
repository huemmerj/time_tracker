const { z } = require('zod');

// Schema for creating a project
const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startTime: z.coerce.date({ required_error: 'Start time is required' }),
  endTime: z.coerce.date({ required_error: 'End time is required' }),
}).refine((data) => {
  // Check if endTime exists and is after startTime
  return !data.endTime || data.endTime > data.startTime;
}, {
  message: 'endTime must be after startTime',
  path: ['endTime'], // This tells Zod where to attach the error
});

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  startTime: z.coerce.date({ required_error: 'Start time is required' }).optional(),
  endTime: z.coerce.date({ required_error: 'End time is required' }).optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'endTime must be after startTime',
  path: ['endTime'],
});


module.exports = { createProjectSchema, updateProjectSchema };