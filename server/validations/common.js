const { param } = require('express-validator');
const mongoose = require('mongoose');

function validateMongoId(paramName) {
  paramName = paramName || 'id';
  return [
    param(paramName).notEmpty().withMessage(paramName + ' is required').isMongoId().withMessage('Invalid ID format'),
  ];
}

function isValidMongoId(id) {
  return id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
}

module.exports = { validateMongoId, isValidMongoId };
