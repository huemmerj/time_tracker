import { ApiResponse } from '../utils/api-response.js';
/**
 * Middleware to handle asynchronous route handlers and catch errors.
 * This middleware wraps the route handler function and catches any errors
 * that occur during its execution, sending a standardized error response.
 *
 * @param {Function} fn - The asynchronous route handler function.
 * @returns {Function} - A middleware function that handles errors.
 */
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    console.error(err); // Optional: log for debugging

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json(ApiResponse.error(message));
  }
};

export default asyncHandler;