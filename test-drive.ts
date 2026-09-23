import { getDriveFileAsDataUri } from "./src/lib/drive";

async function run() {
  const fileId = "1Pg--zs7uq2oU-M4ika68vawQGzFSYtmo"; // from DB
  const mimeType = "image/png";
  const orgId = "c66d53a4-aa7b-4217-a6ce-7b99b266b6c8";
  
  const uri = await getDriveFileAsDataUri(fileId, mimeType, orgId);
  console.log("URI length:", uri ? uri.length : "null");
  if (uri) console.log(uri.substring(0, 100));
}
run().catch(console.error);
