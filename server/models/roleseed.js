const mongoose = require("mongoose");

// Replace with the actual Role schema path if different
const Role = require("./Role"); // Adjust path if needed

const MONGO_URI = "mongodb+srv://kattraanlms:kattraan123@kattraan.2wb5a.mongodb.net/?retryWrites=true&w=majority&appName=Kattraan";

const seedRoles = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(" Connected to MongoDB Atlas");

    

    // Insert numeric roles
    await Role.insertMany([
      { roleId: 1, roleName: "learner", description: "Basic learner access" },
      { roleId: 2, roleName: "instructor", description: "Can create and manage courses" },
      { roleId: 3, roleName: "admin", description: "Full platform access" },
    ]);

    console.log("✅ Roles seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding roles:", err.message);
    process.exit(1);
  }
};

seedRoles();
