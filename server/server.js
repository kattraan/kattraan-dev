require("dotenv").config();

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error("Fatal: JWT_SECRET and JWT_REFRESH_SECRET must be set in environment.");
  process.exit(1);
}

const http = require("http");
const https = require("https");
const app = require("./app");
const connectDB = require("./config/db");
const seedAdmin = require("./helpers/seedAdmin");
const { initSocket } = require("./socket");

const PORT = process.env.PORT || 5001;

// Local HTTPS is opt-in (HTTPS_DEV=true) — needed alongside the Vite https
// dev server so the browser doesn't block API calls as mixed content when
// testing flows (e.g. Cashfree) that require an https origin.
const useHttps = process.env.HTTPS_DEV === "true";
let httpServer;
if (useHttps) {
  const selfsigned = require("selfsigned");
  const cert = selfsigned.generate([{ name: "commonName", value: "localhost" }], { days: 365 });
  httpServer = https.createServer({ key: cert.private, cert: cert.cert }, app);
} else {
  httpServer = http.createServer(app);
}
initSocket(httpServer);

// Connect DB and start server
connectDB().then(async () => {
  // Run seeds
  await seedAdmin();

  httpServer.listen(PORT, () => {
    console.log("Kattraan Live!");
    console.log(`Server running at ${useHttps ? "https" : "http"}://localhost:${PORT}`);
  });
});
