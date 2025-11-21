const express = require("express");
const slack = require("./config/slackClient");
const { createTruckChannel } = require("./modules/truckChannel");

const router = express.Router();

// 🔹 List all channels
router.get("/list-channels", async (req, res) => {
  try {
    const channels = await slack.conversations.list({
      types: "public_channel,private_channel"
    });
    res.json(channels.channels);
  } catch (err) {
    console.error("Error listing channels:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 🔹 Create truck channel
router.post("/create-channel", async (req, res) => {
  try {
    const { truckName, driverSlackId, creatorSlackId } = req.body;
    const channel = await createTruckChannel(truckName, driverSlackId, creatorSlackId);
    res.json({ ok: true, ...channel });
  } catch (err) {
    console.error("Error creating channel:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 🔹 Send dispatch
router.post("/send-dispatch", async (req, res) => {
  try {
    const { channelId, message } = req.body;
    await slack.chat.postMessage({ channel: channelId, text: message });
    res.json({ ok: true });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});



module.exports = router;
