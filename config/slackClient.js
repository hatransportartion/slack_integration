const { WebClient } = require("@slack/web-api");
require("dotenv").config();

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

module.exports = slack;
