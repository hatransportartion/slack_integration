// airtable.js
const Airtable = require("airtable");
const dotenv = require("dotenv");

const envFile =
  process.env.NODE_ENV === "production" ? ".env.prod" : ".env.local";
dotenv.config({ path: envFile });

const base = new Airtable({  apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);




async function uploadFileToAirtable(fileUrl, fileName) {
  try {
    console.log("⬇️ Downloading file from Slack:", fileUrl);
    const record = base(process.env.AIRTABLE_DISPATCH_TABLE_ID).create({
      "Load Status": "Load Template", // Single select
      "Carrier Rate Sheet": [
        {
          url: fileUrl,
          filename: fileName
        }
      ]
    });

    console.log("✅ Airtable record created:", record.id);
    return record;
  } catch (error) {
    console.error(
      "❌ Airtable create failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { uploadFileToAirtable };
