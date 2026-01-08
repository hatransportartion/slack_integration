const uuidv4 = require("uuid").v4;

function generateUniqueFilename() {
  const uniqueId = uuidv4().replace(/-/g, ""); // Remove all hyphens
  return `${uniqueId}`;
}

module.exports = { generateUniqueFilename };