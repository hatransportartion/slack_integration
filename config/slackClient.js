const { WebClient } = require("@slack/web-api");
require("dotenv").config();

console.log("Initializing Slack Client with token:", process.env.SLACK_BOT_TOKEN);
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

module.exports = slack;
