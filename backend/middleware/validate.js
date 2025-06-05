
import { z } from 'zod';
import { ApiResponse } from '../utils/api-response.js';
const idParamsSchema = z.object({
  id: z.string().length(24, 'Invalid ID format'),
})
function validateParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      if (err.errors) {
        console.log(err)
        return res.status(400).json(ApiResponse.error(err.errors[0].message, 400));
      }
      next(err);
    }
  };
}

function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err.errors) {
        let data = {
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        };
        return res.status(400).json(ApiResponse.error("Validation Failed", 400, data));
      }
      next(err);
    }
  };
}

export {
  validateParams,
  validateBody,
  idParamsSchema,
};