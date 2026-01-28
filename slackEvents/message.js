import axios from "axios";
import { uploadFileToAirtable } from "../airtable.js";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

async function handleMessage(event) {
  console.log("Handling message event", JSON.stringify(event));

  const channel = event.channel;
  const ts = event.ts;

  return { success: true };
}

export default handleMessage;
