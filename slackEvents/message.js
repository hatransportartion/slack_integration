import { processSlackFile } from "./processSlackFile.js";

const CHANNEL_WHITELIST = process.env.CHANNEL_WHITELIST?.split(",") || [
  "C0A36B63XM4",
];

async function handleMessage(event) {
  if (event.subtype !== "file_share") return;
  if (event.bot_id) return;
  if (!CHANNEL_WHITELIST.includes(event.channel)) {
    console.log(`🔹 Ignoring file upload in channel ${event.channel}`);
    return;
  }
  if (!event.files?.length) return;

  for (const file of event.files) {
    await processSlackFile(file, {
      source: "upload",
      userId: event.user,
      channel: event.channel,
      ts: event.ts,
    });
  }
}

export default handleMessage;