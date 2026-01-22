const { WebClient } = require("@slack/web-api");
require("dotenv").config();

const botToken = process.env.SLACK_BOT_TOKEN;
if (!botToken) {
  throw new Error("SLACK_BOT_TOKEN is not defined in environment variables");
}
console.log("Initializing Slack Client with token:", botToken);
const slack = new WebClient(botToken);

module.exports = slack;
