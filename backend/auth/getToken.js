// backend/auth/getToken.js
const { getOAuth2Client } = require("./googleAuth");

// Replace this with the code from your redirect URL:
const code = "4/0AVMBsJiITiSz0ELP-igs7uWqal3AAQ54CY6cfLf-srKsWQfQWEIGopxFRt3A1ioZqljYMg";

(async () => {
  try {
    const client = await getOAuth2Client(code);
    console.log("✅ Authenticated and tokens saved.");
  } catch (err) {
    console.error("❌ Token fetch failed:", err);
  }
})();
