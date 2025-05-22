const express = require('express');
const { collections } = require('../db/mongo-client');
const { validateBody, validateParams, idParamsSchema } = require('../middleware/validate');
const { z } = require('zod');
const { ObjectId } = require('mongodb');
const router = express.Router();


// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

