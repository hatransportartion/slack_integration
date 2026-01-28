// airtable.js
import Airtable from "airtable";
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
