
const { z } = require('zod');
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
        return res.status(400).json({ error: err.errors[0].message });
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
        return res.status(400).json({ error: err.errors[0].message });
      }
      next(err);
    }
  };
}

module.exports = {
  validateParams,
  validateBody,
  idParamsSchema,
};