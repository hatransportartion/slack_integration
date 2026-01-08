const express = require("express");
const slack = require("./config/slackClient");
const { createTruckChannel } = require("./modules/truckChannel");
const handleReactionAdded = require("./slackEvents/reactionAdded");
const handleFileShared = require("./slackEvents/fileshared");
const handleMessage = require("./slackEvents/message");

const router = express.Router();

console.log("Router initialized");

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

router.post("/events", async (req, res) => {
  // 1️⃣ URL verification
  console.log("Received Slack event:", req.body);
  if (req.body.type === "url_verification") {
    return res.status(200).send(req.body.challenge);
  }

  try {
    const currentEvent = req.body.event;
    if(currentEvent.channel != "C0A36B63XM4"){
      console.log("Ignoring this event as channel is different");
      res.status(200).send("Channel ID mismatch");
      console.log("RRR");
    }

    if (!currentEvent) return;

    switch (currentEvent.type) {
      case "reaction_added":
        await handleReactionAdded(currentEvent);
        break;
      
      case "file_shared":
        await handleFileShared(currentEvent);
        break;

      case "message":
        // Handle message events if needed
        await handleMessage(currentEvent);
        break;

      default:
        console.log("Unhandled Slack event:", currentEvent.type);
    }
  } catch (err) {
    console.error("Slack event handler error:", err.message, "\n Event: ", JSON.stringify(req.body) );
  }
  res.sendStatus(200);
});


module.exports = router;
