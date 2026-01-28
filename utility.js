import { v4 as uuidv4 } from "uuid";

export function generateUniqueFilename() {
  return uuidv4().replace(/-/g, "");
}
