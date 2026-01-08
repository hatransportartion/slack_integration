const axios = require("axios");
const { uploadFileToAirtable } = require("../airtable");
const { generateUniqueFilename } = require("../utility");
const fs = require("fs");

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

async function handleReactionAdded(event) {
  if (event.reaction !== "+1") return;

  const channel = event.item.channel;
  const ts = event.item.ts;

  try {
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

    const message = response.data.messages?.[0];

    if (!message?.files?.length) {
      console.log("👍 reaction but no file attached");
      return;
    }

    const file = message.files[0];

    console.log("👍 File 1 approved:", {
      name: file.name,
      type: file.filetype,
      url: file.url_private_download,
      approvedBy: event.user
    });

    //download file to local folder
    const fileResponse = await axios.get(file.url_private_download, {
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`
      },
      responseType: "arraybuffer"
    });
    
    // const fileBuffer = Buffer.from(fileResponse.data, "binary");
    // console.log("Downloaded file size (bytes):", fileBuffer.length);


    const fileName = generateUniqueFilename();
    let outputFilePath = `/home/app/docs/${fileName}`;
    const NODE_ENV = process.env.NODE_ENV || "local";
    console.log("NODE_ENV: ", NODE_ENV);
    console.log("Output File Path: ", outputFilePath);
    if (NODE_ENV === "local") {
      outputFilePath = `docs/${fileName}`;
    }
    console.log("Output File Path: ", outputFilePath);
    const fileBuffer = Buffer.from(fileResponse.data, "binary");
    fs.writeFileSync(outputFilePath, fileBuffer);
    console.log("File saved to:", outputFilePath);


    const URL = 'https://api.handatransportation.com/docs/' + fileName;
    // const URL = "https://api.handatransportation.com/docs/63687ef7835c4b42b2c57ead3528824f.pdf";

    const resp = await uploadFileToAirtable(URL, fileName);
    console.log("File uploaded to Airtable:", JSON.stringify(resp));

    // 🔥 YOUR BUSINESS LOGIC HERE
    // - Download file
    // - Upload to Airtable / S3
    // - Trigger Make / webhook
  } catch (err) {
    console.error("Reaction handler error:", err.message);
  }
}

module.exports = handleReactionAdded;