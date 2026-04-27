import { Router } from "express";
import slack from "./config/slackClient.js";
import { createTruckChannel } from "./modules/truckChannel.js";
import handleReactionAdded from "./slackEvents/reactionAdded.js";
import handleMessage from "./slackEvents/message.js";

const router = Router();

console.log("Router initialized");

// 🔹 List all channels
router.get("/list-channels", async (req, res) => {
  try {
    const channels = await slack.conversations.list({
      types: "public_channel,private_channel",
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
    const channel = await createTruckChannel(
      truckName,
      driverSlackId,
      creatorSlackId,
    );
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
      text,
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
  if (req.body.type === "url_verification") {
    return res.status(200).send(req.body.challenge);
  }

  // Ack first — Slack retries anything that takes >3s
  res.sendStatus(200);

  const currentEvent = req.body.event;
  if (!currentEvent) return;

  try {
    switch (currentEvent.type) {
      case "reaction_added":
        await handleReactionAdded(currentEvent);
        break;
      case "message":
        await handleMessage(currentEvent);
        break;
      default:
        console.log("Unhandled Slack event:", currentEvent.type);
    }
  } catch (err) {
    console.error("Slack event handler error:", err.message);
  }
});

export default router;
