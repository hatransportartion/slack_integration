import axios from "axios";
import { processSlackFile } from "../slackEvents/processSlackFile.js";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_API_BASE = "https://slack.com/api";

const REACTION_WHITELIST = process.env.REACTION_WHITELIST?.split(",") || ["+1"];
const CHANNEL_WHITELIST = process.env.CHANNEL_WHITELIST?.split(",") || [
  "C0A36B63XM4",
];

async function handleReactionAdded(event) {
  if (!REACTION_WHITELIST.includes(event.reaction)) return;

  const { channel, ts } = event.item;
  if (!CHANNEL_WHITELIST.includes(channel)) return;

  try {
    const { data } = await axios.get(
      `${SLACK_API_BASE}/conversations.history`,
      {
        headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
        params: { channel, latest: ts, inclusive: true, limit: 1 },
        timeout: 2500,
      },
    );

    const file = data.messages?.[0]?.files?.[0];
    if (!file) {
      console.log("👍 reaction but no file attached");
      return;
    }

    await processSlackFile(file, { source: "reaction", userId: event.user });
  } catch (err) {
    console.error("❌ Reaction handler error:", err.message);
  }
}

export default handleReactionAdded;