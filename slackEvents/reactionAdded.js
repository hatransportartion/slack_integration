import axios from "axios";
import { writeFile } from "fs/promises";
import { uploadFileToAirtable } from "../airtable.js";
import { generateUniqueFilename } from "../utility.js";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_API_BASE = "https://slack.com/api";

const EXTENSION_MAP = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

// ✅ Only process these channels
const CHANNEL_WHITELIST = [
  "C0A36B63XM4", // replace with your actual channel IDs
  "C0A36B63XM4",
  "C0A36B63XM4",
];

const REACTION_WHITELIST = ["+1", "white_check_mark"];

async function handleReactionAdded(event) {
  if (!REACTION_WHITELIST.includes(event.reaction)) {
    console.log(`🔹 Ignoring reaction ${event.reaction}`);
    return;
  }

  const { channel } = event.item;

  // ✅ Skip channels not in whitelist
  if (!CHANNEL_WHITELIST.includes(channel)) {
    console.log(`🔹 Ignoring reaction in channel ${channel}`);
    return;
  }

  try {
    const { ts } = event.item;

    /* ------------------ Fetch message ------------------ */
    const { data } = await axios.get(
      `${SLACK_API_BASE}/conversations.history`,
      {
        headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
        params: {
          channel,
          latest: ts,
          inclusive: true,
          limit: 1,
        },
        timeout: 2500, // prevents Slack retries
      },
    );

    const message = data.messages?.[0];
    const file = message?.files?.[0];

    if (!file) {
      console.log("👍 reaction but no file attached");
      return;
    }

    console.log("👍 File approved:", {
      name: file.name,
      type: file.filetype,
      approvedBy: event.user,
    });

    /* ------------------ Download file ------------------ */
    const fileResponse = await axios.get(file.url_private_download, {
      headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
      responseType: "arraybuffer",
      timeout: 2500,
    });

    const contentType = fileResponse.headers["content-type"];
    const extension = EXTENSION_MAP[contentType] ?? "";

    const fileName = `${generateUniqueFilename()}${extension}`;
    const outputDir =
      process.env.NODE_ENV === "local" ? "docs" : "/home/app/docs";

    const outputFilePath = `${outputDir}/${fileName}`;
    await writeFile(outputFilePath, Buffer.from(fileResponse.data));

    console.log("📁 File saved:", outputFilePath);

    /* ------------------ Upload to Airtable ------------------ */
    const publicURL = `https://api.handatransportation.com/docs/${fileName}`;
    await uploadFileToAirtable(publicURL, fileName);

    console.log("✅ File uploaded to Airtable:", fileName);
  } catch (err) {
    console.error("❌ Reaction handler error:", err);
  }
}

export default handleReactionAdded;
