import { WebClient } from "@slack/web-api";
// import dotenv from "dotenv";

// let NODE_ENV = process.env.NODE_ENV || "production";

// if (NODE_ENV == "local") {
//   dotenv.config({ path: ".env.local" });
// } else if (NODE_ENV == "production") {
//   dotenv.config({ path: ".env.prod" });
// } else {
//   dotenv.config();
// }

const botToken = process.env.SLACK_BOT_TOKEN;

if (!botToken) {
  throw new Error("❌ SLACK_BOT_TOKEN is not defined");
}

const slack = new WebClient(botToken);

export default slack;
