// backend/auth/googleAuth.js
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
};

const getOAuth2Client = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens to tokens.json
    const tokenPath = path.join(__dirname, "../tokens.json");
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
    console.log("📁 Tokens saved to tokens.json");

    return oauth2Client;
  } catch (err) {
    console.error("❌ Error exchanging code for tokens:", err);
    throw err;
  }
};

module.exports = {
  getAuthUrl,
  getOAuth2Client,
  oauth2Client,
};
