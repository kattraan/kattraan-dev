require("dotenv").config();

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error("Fatal: JWT_SECRET and JWT_REFRESH_SECRET must be set in environment.");
  process.exit(1);
}

const app = require("./app");
const connectDB = require("./config/db");
const seedAdmin = require("./helpers/seedAdmin");

const PORT = process.env.PORT || 5001;

// Connect DB and start server
connectDB().then(async () => {
  // Run seeds
  await seedAdmin();

  app.listen(PORT, () => {
    console.log("Kattraan Live!");
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
