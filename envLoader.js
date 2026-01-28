// envLoader.js
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

/* -------------------- Determine NODE_ENV -------------------- */
const NODE_ENV = process.env.NODE_ENV || "production";

/* -------------------- Pick dotenv file -------------------- */
const envFile = NODE_ENV === "production" ? ".env.prod" : ".env.local";
const envPath = path.resolve(process.cwd(), envFile);

/* -------------------- Load dotenv -------------------- */
if (!fs.existsSync(envPath)) {
  console.error(`❌ Environment file not found: ${envPath}`);
  process.exit(1);
}

dotenv.config({ path: envPath });

console.log(`✅ Loaded environment: ${envFile} (NODE_ENV=${NODE_ENV})`);

/* -------------------- Required env vars -------------------- */
const REQUIRED_VARS = [
  "SLACK_BOT_TOKEN",
  "PORT",
  "AIRTABLE_API_KEY",
  "AIRTABLE_BASE_ID",
  "AIRTABLE_DISPATCH_TABLE_ID",
];

const missingVars = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingVars.join(", "),
  );
  process.exit(1);
}

/* -------------------- Optional: Safe logging -------------------- */
const safeLog = {};
REQUIRED_VARS.forEach((key) => {
  const val = process.env[key];
  safeLog[key] =
    key.includes("TOKEN") || key.includes("API_KEY") ? "***MASKED***" : val;
});

console.log("✅ Environment variables loaded:", safeLog);

/* -------------------- Export NODE_ENV -------------------- */
export { NODE_ENV };
