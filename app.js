const dotenv = require("dotenv");
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
});
const express = require("express");
const session = require("express-session");
const passport = require("passport");

const logger = require("./utils/logger");
const Initializer = require("./firebase/Initializer");
const Seeder = require("./firebase/Seeder");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
// Route controllers
const authRoutes = require("./routes/authRoutes");

// Middleware
const authMiddleware = require("./middleware/middleware");
const errorHandler = require("./middleware/errorHandler");

// Create express app
const app = express();

// Perform Initialization and Seeding
(async () => {
  try {
    const init = new Initializer();
    await init.init();
    logger.info("✅ Firebase Initialization complete");

    const seedData = [
      {
        collection: "settings",
        documents: [{ id: "global", data: { appName: "My App", maintenance: false } }],
      },
    ];

    const seeder = new Seeder(seedData);
    await seeder.seed();
    logger.info("✅ Firebase Seeding complete");
  } catch (e) {
    logger.error("Startup Initialization Error", { error: e.message });
  }
})();

// Middleware setup
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // True in production for HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.use("/auth", authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Protected test route
app.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Welcome!", user: req.user });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Server started on http://localhost:${PORT}`);
});
