import axios from "axios";
import { writeFile, mkdir } from "fs/promises";
import { uploadFileToAirtable } from "../airtable.js";
import { generateUniqueFilename } from "../utility.js";
import slack from "../config/slackClient.js";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

const EXTENSION_MAP = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const PUBLIC_BASE_URL = (
  process.env.PUBLIC_FILE_BASE_URL || "https://api.handatransportation.com"
).replace(/\/$/, "");

const OUTPUT_DIR =
  process.env.NODE_ENV === "local" ? "docs" : "/home/app/docs";

// Tracks files currently being processed — concurrent callers await the same promise
const inFlight = new Map();
// Tracks files that finished successfully — never reprocess
const completed = new Set();

export async function processSlackFile(file, opts = {}) {
  if (!file?.url_private_download) {
    console.log("⚠️ No downloadable file URL");
    return;
  }

  // Already finished — skip
  if (completed.has(file.id)) {
    console.log(`✅ File ${file.id} already completed (source: ${opts.source})`);
    return;
  }

  // Already in progress — wait on the existing run instead of starting a new one
  if (inFlight.has(file.id)) {
    console.log(`⏳ File ${file.id} already processing, waiting (source: ${opts.source})`);
    return inFlight.get(file.id);
  }

  // Kick off processing and store the promise atomically
  const promise = doProcess(file, opts).then(
    () => {
      completed.add(file.id);
      inFlight.delete(file.id);
    },
    (err) => {
      // Remove from inFlight on failure so a retry is possible
      inFlight.delete(file.id);
      throw err;
    }
  );

  inFlight.set(file.id, promise);

  // Swallow the error here so callers don't need their own try/catch —
  // doProcess already logs it
  return promise.catch(() => {});
}

async function doProcess(file, { source, userId, channel, ts } = {}) {
  console.log("📎 Processing file:", {
    id: file.id,
    name: file.name,
    type: file.filetype,
    source,
    userId,
  });

  try {
    const fileResponse = await axios.get(file.url_private_download, {
      headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
      responseType: "arraybuffer",
      timeout: 5000,
    });

    const contentType = fileResponse.headers["content-type"];
    const extension = EXTENSION_MAP[contentType] ?? "";
    const fileName = `${generateUniqueFilename()}${extension}`;
    const outputFilePath = `${OUTPUT_DIR}/${fileName}`;

    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(outputFilePath, Buffer.from(fileResponse.data));
    console.log("📁 File saved:", outputFilePath);

    const publicURL = `${PUBLIC_BASE_URL}/docs/${fileName}`;
    console.log("🌐 Public URL for Airtable:", publicURL);

    await uploadFileToAirtable(publicURL, fileName);
    console.log("✅ File uploaded to Airtable:", fileName);

    // 👍 Confirm to user with a reaction on the original message
    if (channel && ts) {
      try {
        await slack.reactions.add({
          channel,
          timestamp: ts,
          name: "thumbsup",
        });
        console.log("👍 Reaction added to message");
      } catch (reactErr) {
        // Don't fail the whole flow if reaction fails (e.g. already_reacted)
        if (reactErr.data?.error !== "already_reacted") {
          console.error(
            "⚠️ Failed to add reaction:",
            reactErr.data?.error || reactErr.message
          );
        }
      }
    }
  } catch (err) {
    console.error("❌ processSlackFile error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
    throw err; // re-throw so the inFlight wrapper sees the failure
  }
}