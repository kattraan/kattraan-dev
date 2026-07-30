require("dotenv").config();

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error("Fatal: JWT_SECRET and JWT_REFRESH_SECRET must be set in environment.");
  process.exit(1);
}

const http = require("http");
const https = require("https");
const { execSync } = require("child_process");
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");
const seedAdmin = require("./helpers/seedAdmin");
const { initSocket, getIO } = require("./socket");

const PORT = process.env.PORT || 5001;

/** Kill any other process currently listening on `port` (not this process). */
function freePort(port) {
  try {
    if (process.platform === "win32") {
      const out = execSync("netstat -ano", { encoding: "utf8" });
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        if (!line.includes("LISTENING")) continue;
        const parts = line.trim().split(/\s+/);
        // netstat: Proto LocalAddress ForeignAddress State PID
        const local = parts[1] || "";
        if (!local.endsWith(`:${port}`)) continue;
        const pid = Number(parts[parts.length - 1]);
        if (pid && pid !== process.pid) pids.add(pid);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
          console.warn(`Freed port ${port} (killed PID ${pid})`);
        } catch {
          /* process already gone */
        }
      }
    } else {
      try {
        const out = execSync(`lsof -ti:${port}`, { encoding: "utf8" }).trim();
        for (const pid of out.split(/\n/).map(Number).filter(Boolean)) {
          if (pid === process.pid) continue;
          try {
            process.kill(pid, "SIGKILL");
            console.warn(`Freed port ${port} (killed PID ${pid})`);
          } catch {
            /* process already gone */
          }
        }
      } catch {
        /* nothing listening */
      }
    }
  } catch {
    /* ignore */
  }
}

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

function startListening() {
  freePort(PORT);
  httpServer.listen(PORT, () => {
    console.log("Kattraan Live!");
    console.log(`Server running at ${useHttps ? "https" : "http"}://localhost:${PORT}`);
  });
}

httpServer.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.warn(`Port ${PORT} still in use — retrying...`);
    setTimeout(startListening, 800);
    return;
  }
  throw err;
});

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n${signal} received — shutting down...`);

  const io = getIO();
  if (io) {
    try {
      await io.close();
    } catch {
      /* ignore */
    }
  }

  await new Promise((resolve) => {
    httpServer.close(() => resolve());
    // Force-close if hang (open keep-alive / socket clients)
    setTimeout(resolve, 1500).unref();
  });

  try {
    await mongoose.connection.close(false);
  } catch {
    /* ignore */
  }

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
// nodemon sends this on restart (Unix); on Windows it just kills — freePort covers that
process.once("SIGUSR2", () => {
  shutdown("SIGUSR2").then(() => process.kill(process.pid, "SIGUSR2"));
});

// Connect DB and start server
connectDB().then(async () => {
  await seedAdmin();
  startListening();
});
