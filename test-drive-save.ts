import { getDriveFileAsDataUri } from "./src/lib/drive";
import fs from "fs";

async function run() {
  const fileId = "1Pg--zs7uq2oU-M4ika68vawQGzFSYtmo"; 
  const mimeType = "image/png";
  const orgId = "c66d53a4-aa7b-4217-a6ce-7b99b266b6c8";
  
  const uri = await getDriveFileAsDataUri(fileId, mimeType, orgId);
  if (uri) {
    const base64Data = uri.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync("out.png", base64Data, 'base64');
    console.log("Saved out.png");
  }
}
run().catch(console.error);
