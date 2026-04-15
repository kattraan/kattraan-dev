const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./config/passport-setup"); // Load passport config

// Routes
const authRoutes = require("./routes/auth-routes/index");
const courseRoutes = require("./routes/course-routes");
const adminRoutes = require("./routes/admin-routes");

// const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
// const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const learnerCourseProgressRoutes = require("./routes/learner-routes/course-progress-routes");
const learnerCoursesRoutes = require("./routes/learner-routes/learner-courses-routes");
const learnerAssignmentsRoutes = require("./routes/learner-routes/learner-assignments-routes");
const learnerChapterEngagementRoutes = require("./routes/learner-routes/chapter-engagement-routes");
const userRoutes = require("./routes/users-routes/users-routes");
const instructorLearnersRoutes = require("./routes/instructor-routes/learners.routes");
const instructorStatsRoutes = require("./routes/instructor-routes/stats.routes");
const instructorChapterEngagementTemplateRoutes = require("./routes/instructor-routes/chapter-engagement-templates.routes");
const exchangeRoutes = require("./routes/exchange-routes/exchange.routes");
const razorpayRoutes = require("./routes/payment-routes/razorpay.routes");
const cartRoutes = require("./routes/cart-routes/cart.routes");
const videoRoutes = require("./routes/video-routes/video.routes");
const webhooksRoutes = require("./routes/webhooks/bunnyStream.routes");
const csrfProtection = require("./middleware/csrf");

const app = express();
app.use(express.json());

// Middleware
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// CSRF protection – validates Origin header for all state-changing requests
app.use(csrfProtection);

// Serve client assets for Swagger UI (Kattraan logo) from single source of truth
app.use(
  "/docs-assets",
  express.static(path.join(__dirname, "../client/src/assets")),
);

// Swagger Docs – Kattraan branding (logo + brand colors)
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info {
      margin: 24px 0; padding: 24px 24px 24px 24px; padding-top: 72px;
      background: linear-gradient(135deg, #0c091a 0%, #1a1625 50%, #0c091a 100%);
      border-radius: 12px; color: #fff;
      border: 1px solid rgba(255, 63, 180, 0.15);
      position: relative;
    }
    .swagger-ui .info::before {
      content: ''; position: absolute; top: 20px; left: 24px;
      width: 44px; height: 44px;
      background: url('/docs-assets/logo.png') center/contain no-repeat;
    }
    .swagger-ui .info .title { font-size: 1.75rem; font-weight: 600; color: #fff; margin-bottom: 8px; padding-left: 0 }
    .swagger-ui .info p,
    .swagger-ui .info ul, .swagger-ui .info li,
    .swagger-ui .info strong, .swagger-ui .info span, .swagger-ui .info div { color: #fff; line-height: 1.6 }
    .swagger-ui .info p { margin: 8px 0 }
    .swagger-ui .info a { color: #ff3fb4 }
    .swagger-ui .info a:hover { color: #9e30ff }
    .swagger-ui { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif }
    .swagger-ui .opblock-tag { font-size: 1.1rem; font-weight: 600; border-bottom: 1px solid rgba(158, 48, 255, 0.2); padding: 12px 0; color: #0c091a }
    .swagger-ui .opblock { border-radius: 8px; margin: 8px 0; border: 1px solid #e2e8f0 }
    .swagger-ui .opblock.opblock-get { border-color: #22c55e; background: rgba(34, 197, 94, 0.06) }
    .swagger-ui .opblock.opblock-post { border-color: #9e30ff; background: rgba(158, 48, 255, 0.06) }
    .swagger-ui .opblock.opblock-put { border-color: #FF8C42; background: rgba(255, 140, 66, 0.06) }
    .swagger-ui .opblock.opblock-delete { border-color: #ef4444; background: rgba(239, 68, 68, 0.06) }
    .swagger-ui .opblock .opblock-summary-method { border-radius: 6px; font-weight: 600 }
    .swagger-ui .opblock-body { background: #fff }
    .swagger-ui .opblock-body .tab-item { padding: 12px 16px }
    .swagger-ui .model-box-control { color: #64748b }
    .swagger-ui section.models { border: 1px solid rgba(158, 48, 255, 0.15); border-radius: 8px; margin: 16px 0 }
    .swagger-ui .model-title { font-weight: 600; color: #334155 }
    .swagger-ui table thead tr th { border-bottom: 2px solid #e2e8f0; padding: 10px 12px; color: #475569 }
    .swagger-ui table tbody tr td { padding: 10px 12px; color: #334155 }
    .swagger-ui .btn.execute {
      background: linear-gradient(135deg, #9e30ff 0%, #ff3fb4 100%); border: none; border-radius: 6px; font-weight: 500; color: #fff;
    }
    .swagger-ui .btn.execute:hover { opacity: 0.92 }
    .swagger-ui select { border-radius: 6px; border-color: #cbd5e1 }
    .swagger-ui input[type=text], .swagger-ui textarea { border-radius: 6px; border-color: #cbd5e1 }
    .swagger-ui .response-col_status { font-weight: 600 }
    .swagger-ui .loading-container { padding: 24px }
    .swagger-ui .info .link { color: #ff3fb4 }
    .swagger-ui .information-container { background: #f8fafc }
  `,
  swaggerOptions: {
    docExpansion: "list",
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
  },
};
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerOptions),
);

// // CORS
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // Manual CORS Headers (Optional)
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:5173");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   next();
// });

// CORS: require CLIENT_URL in production so we never fall back to localhost
const isProduction = process.env.NODE_ENV === "production";
const clientOrigin =
  process.env.CLIENT_URL || (isProduction ? null : "http://localhost:5173");
if (
  isProduction &&
  (!clientOrigin || clientOrigin === "http://localhost:5173")
) {
  throw new Error(
    "CLIENT_URL must be set in production (e.g. https://your-app.com). Do not use localhost.",
  );
}
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);
app.options("*", cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", courseRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/learner/course-progress", learnerCourseProgressRoutes);
app.use("/api/learner/courses", learnerCoursesRoutes);
app.use("/api/learner/assignments", learnerAssignmentsRoutes);
app.use("/api/learner/chapter-engagement", learnerChapterEngagementRoutes);
app.use("/api/users", userRoutes);
app.use("/api/instructor/learners", instructorLearnersRoutes);
app.use("/api/instructor/stats", instructorStatsRoutes);
app.use(
  "/api/instructor/chapter-engagement/templates",
  instructorChapterEngagementTemplateRoutes,
);
app.use("/api/exchange-rates", exchangeRoutes);
app.use("/api/payment/razorpay", razorpayRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/webhooks", webhooksRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Resource not found" });
});

// Global Error Handler (sanitized: no stack traces or technical details in response)
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  console.error("Global Error:", err.stack || err.message);
  const message =
    status < 500
      ? err.message || "Bad request"
      : isProduction
        ? "Something went wrong. Please try again later."
        : err.message || "Something went wrong";
  res.status(status).json({
    success: false,
    message,
  });
});

module.exports = app;
