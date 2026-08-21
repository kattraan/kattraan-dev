const mongoose = require("mongoose");

/** Drop legacy full unique index on communities.course so archived rows don't block recreate. */
async function migrateCommunityCourseIndex() {
  try {
    const col = mongoose.connection.collection("communities");
    const indexes = await col.indexes();
    const legacy = indexes.find((idx) => idx.name === "course_1" && idx.unique && !idx.partialFilterExpression);
    if (legacy) {
      await col.dropIndex("course_1");
      console.log("Dropped legacy communities.course_1 unique index");
    }
    // Ensure the partial unique index from the Community schema exists
    require("../models/Community");
    await mongoose.model("Community").createIndexes();
  } catch (err) {
    console.warn("Community course index migration skipped:", err.message);
  }
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
    await migrateCommunityCourseIndex();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
