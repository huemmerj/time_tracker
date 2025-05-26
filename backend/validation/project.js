import { z } from 'zod'

// Schema for creating a project
const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
})


export { createProjectSchema, updateProjectSchema };