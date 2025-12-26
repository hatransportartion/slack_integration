const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const slack = require("./config/slackClient");

dotenv.config();

const app = express();
app.use(express.json());

let count = 0;

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

/**
 * Slack Event Listener (runs all the time)
 */
app.post("/slack/events", async (req, res) => {

    console.log("Count:", ++count, new Date().toISOString());

    console.log("Received Slack event:", req.body, "--------------");
  // 1️⃣ Slack URL verification
  if (req.body.type === "url_verification") {
    return res.status(200).send(req.body.challenge);
  }

  // 2️⃣ Acknowledge immediately
//   res.sendStatus(200);

  const event = req.body.event;

  // 3️⃣ Listen for 👍 reaction
  if (
    event?.type === "reaction_added" &&
    event.reaction === "+1"
  ) {
    try {
      const channel = event.item.channel;
      const ts = event.item.ts;

      // 4️⃣ Fetch message to get file info
      const response = await axios.get(
        "https://slack.com/api/conversations.history",
        {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`
          },
          params: {
            channel,
            latest: ts,
            inclusive: true,
            limit: 1
          }
        }
      );

      console.log("Slack API response:", response.data);

      const message = response.data.messages?.[0];

      if (!message?.files?.length) {
        console.log("👍 reaction but no file attached");
        return;
      }

      // 5️⃣ Get first file
      const file = message.files[0];

      console.log("👍 File approved:");
      console.log({
        name: file.name,
        type: file.filetype,
        url: file.url_private_download,
        approvedBy: event.user
      });

      // 🔥 HERE you have the file request
      // You can:
      // - Download file
      // - Send to another service
      // - Save metadata in DB

    } catch (err) {
      console.error("Slack processing error:", err.message);
    }
  }
});


app.post("/slack/events-old", async (req, res) => {
  // 1️⃣ Slack URL verification

  console.log("Received Slack event:", req.body);

  if (req.body.type === "url_verification") {
    return res.status(200).send(req.body.challenge);
  }

  // 2️⃣ Acknowledge immediately
  res.sendStatus(200);

});

app.post("/send-dispatch", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { channel, text } = req.body;

    await slack.chat.postMessage({
      channel,
      text
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Server always running
 */
app.listen(9000, () => {
  console.log("Slack listener running on port 8000");
});
