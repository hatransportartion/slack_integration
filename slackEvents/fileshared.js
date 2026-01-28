import axios from "axios";
import { uploadFileToAirtable } from "../airtable.js";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

async function handleFileShared(event) {
  console.log("Handling file_shared event", JSON.stringify(event));

  const channel = event.item.channel;
  const ts = event.item.ts;

  try {
    const response = await axios.get(
      "https://slack.com/api/conversations.history",
      {
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
        },
        params: {
          channel,
          latest: ts,
          inclusive: true,
          limit: 1,
        },
      },
    );

    const message = response.data.messages?.[0];

    if (!message?.files?.length) {
      console.log("👍 reaction but no file attached");
      return;
    }

    const file = message.files[0];

    console.log("👍 File 2 approved:", {
      name: file.name,
      type: file.filetype,
      url: file.url_private_download,
      approvedBy: event.user,
    });
  } catch (err) {
    console.error("Reaction handler error:", err.message);
  }
}

export default handleFileShared;
