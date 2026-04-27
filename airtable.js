// airtable.js
import Airtable from "airtable";

// POST https://content.airtable.com/v0/{baseId}/{recordId}/{fieldIdOrName}/uploadAttachment
import axios from "axios";
import { readFile } from "fs/promises";
// import dotenv from "dotenv";

// let NODE_ENV = process.env.NODE_ENV || "production";

// if (NODE_ENV == "local") {
//   dotenv.config({ path: ".env.local" });
// } else if (NODE_ENV == "production") {
//   dotenv.config({ path: ".env.prod" });
// } else {
//   dotenv.config();
// }

if (!process.env.AIRTABLE_API_KEY) {
  throw new Error("❌ AIRTABLE_API_KEY is missing");
}
if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error("❌ AIRTABLE_BASE_ID is missing");
}
if (!process.env.AIRTABLE_DISPATCH_TABLE_ID) {
  throw new Error("❌ AIRTABLE_DISPATCH_TABLE_ID is missing");
}

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

export async function uploadFileToAirtable(fileUrl, fileName) {
  try {
    console.log("⬆️ Uploading file to Airtable:", fileName);

    const record = await base(process.env.AIRTABLE_DISPATCH_TABLE_ID).create({
      "Load Status": "Load Template",
      "Carrier Rate Sheet": [
        {
          url: fileUrl,
          filename: fileName,
        },
      ],
    });

    console.log("✅ Airtable record created:", record.id);
    return record;
  } catch (error) {
    console.error(
      "❌ Airtable create failed:",
      error.response?.data || error.message,
    );
    throw error;
  }
}


export async function attachFileToAirtableRecord(recordId, fieldName, filePath, contentType, filename) {
  const fileBuffer = await readFile(filePath);
  const base64 = fileBuffer.toString("base64");

  const url = `https://content.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${recordId}/${encodeURIComponent(fieldName)}/uploadAttachment`;

  const { data } = await axios.post(
    url,
    {
      contentType,
      file: base64,
      filename,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
        "Content-Type": "application/json",
      },
    }
  );

  return data;
}
