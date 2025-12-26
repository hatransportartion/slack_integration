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


//Not working now, need to fix later
// router.get("/deleteChannel", async (req, res) => {
//   try {
//     const { channelId } = req.query;
//     // delete the channel permanently
//     await slack.conversations.archive({ channel: channelId });
//     res.json({ ok: true });
//   } catch (err) {
//     console.error("Error archiving channel:", err);
//     res.status(500).json({ ok: false, error: err.message });
//   }
// });

router.post("addRateCon", async (req, res) => {
  try {
    const { channelId, userId } = req.body;
    // await slack.conversations.invite({
    //   channel: channelId,
    //   users: userId
    // });
    // res.json({ ok: true });
  } catch (err) {
    console.error("Error adding rate con:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


module.exports = router;
