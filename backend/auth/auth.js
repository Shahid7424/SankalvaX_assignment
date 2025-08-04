// backend/auth/auth.js
const { google } = require("googleapis");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
});

console.log("👉 Authorize this app by visiting this URL:\n", authUrl);
