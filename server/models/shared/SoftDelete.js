// _shared/SoftDelete.js
const SoftDelete = {
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletedBy: {
    type: String,
  },
};

module.exports = SoftDelete;
