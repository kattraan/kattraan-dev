const mongoose = require('mongoose');

const DeletedUserSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  data: { type: Object, required: true },
  deletedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DeletedUser', DeletedUserSchema);
