import { z } from 'zod'


// Schema for creating a project
const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'Invalid hex color code',
  }),
})

const updateTagSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
    message: 'Invalid hex color code',
  }).optional(),
})

export { createTagSchema, updateTagSchema };