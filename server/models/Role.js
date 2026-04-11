const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  roleId: {
    type: String, // UUID format
    required: true,
    unique: true,
  },
  roleName: {
    type: String,
    required: true,
    enum: ["learner", "instructor", "admin"],
    unique: true,
  },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Role", RoleSchema);
