const slack = require("../config/slackClient");

async function createTruckChannel(truckName, driverSlackId, creatorSlackId) {
  // Slack-safe channel name
  let channelName = "truck-" + truckName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // 1. Create private channel
  const channelRes = await slack.conversations.create({
    name: channelName,
    is_private: true
  });

  if (!channelRes.ok) throw new Error(channelRes.error);
  const channelId = channelRes.channel.id;

  // 2. Invite dispatchers, driver, creator
  let usersToInvite = [];
  if (process.env.DISPATCHER_IDS) {
    usersToInvite.push(...process.env.DISPATCHER_IDS.split(","));
  }
  if (driverSlackId) usersToInvite.push(driverSlackId);
  if (creatorSlackId) usersToInvite.push(creatorSlackId);

  if (usersToInvite.length > 0) {
    await slack.conversations.invite({
      channel: channelId,
      users: usersToInvite.join(",")
    });
  }

  return { channelId, channelName };
}



module.exports = { createTruckChannel };
