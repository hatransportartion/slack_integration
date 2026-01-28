import "./envLoader.js";
import express from "express";

import route from "./route.js";
import logger from "./middlewares/logger.js";
import errorHandler from "./middlewares/errorHandler.js";

import { NODE_ENV } from "./envLoader.js";

/* -------------------- APP SETUP -------------------- */
const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------- Middlewares -------------------- */
app.use(express.json({ limit: "1mb" })); // ⬅️ no body-parser needed
app.use(logger);

/* ---------------------- Routes ----------------------- */
app.use("/slack", route);

/* ------------------ Error Handler -------------------- */
app.use(errorHandler);

/* -------------------- Server ------------------------- */
const server = app.listen(PORT, () => {
  console.log(`🚀 Slack Bot running on port ${PORT} (${NODE_ENV})`);
});

/* --------------- Graceful Shutdown ------------------- */
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

function shutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
}
