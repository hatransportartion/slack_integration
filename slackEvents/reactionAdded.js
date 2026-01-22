const axios = require("axios");
const { uploadFileToAirtable } = require("../airtable");
const { generateUniqueFilename } = require("../utility");
const fs = require("fs");

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

async function handleReactionAdded(event) {
  if (event.reaction !== "+1") return;

  try {
    if (event.reaction !== "+1") return;

    const channel = event.item.channel;
    const ts = event.item.ts;
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

    console.log(" filetype: ", fileResponse.headers['content-type']);
    console.log(" content-length: ", fileResponse.headers['content-length']);
    //as file type is filetype:  application/pdf, add it the file name while saving
    
    // const fileBuffer = Buffer.from(fileResponse.data, "binary");
    // console.log("Downloaded file size (bytes):", fileBuffer.length);

    const fileType = fileResponse.headers['content-type'];
    let extension = '';
    if (fileType === 'application/pdf') {
      extension = '.pdf';
    } else if (fileType === 'image/jpeg') {
      extension = '.jpg';
    } else if (fileType === 'image/png') {
      extension = '.png';
    }else{
      extension = '';
    }




    const fileName = generateUniqueFilename()+ extension;
    let outputFilePath = `/home/app/docs/${fileName}`;
    const NODE_ENV = process.env.NODE_ENV || "production";
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
    // const URL = "https://api.handatransportation.com/docs/1c018ed627504cc183e0142cae94fcb2.pdf";

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