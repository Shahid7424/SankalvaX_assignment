// backend/gmailReal.js
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const pdfParse = require('pdf-parse');

const TOKEN_PATH = path.join(__dirname, 'tokens.json');

async function getAuthenticatedClient() {
  if (!fs.existsSync(TOKEN_PATH)) throw new Error('Missing tokens.json');

  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials(tokens);

  // Automatically refresh access token if needed
  oauth2Client.on('tokens', (newTokens) => {
    const updatedTokens = { ...tokens, ...newTokens };
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(updatedTokens));
    console.log('🔄 Access token refreshed and saved.');
  });

  return oauth2Client;
}

function findPdfPart(parts) {
  for (const part of parts) {
    if (part.mimeType === 'application/pdf' && part.filename) {
      return part;
    }
    if (part.parts) {
      const found = findPdfPart(part.parts);
      if (found) return found;
    }
  }
  return null;
}

async function fetchRealEmailAndParsePDF() {
  try {
    const auth = await getAuthenticatedClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'has:attachment filename:pdf newer_than:30d',
      maxResults: 1,
    });

    console.log('📬 Gmail Messages:', res.data.messages);

    const message = res.data.messages?.[0];
    if (!message) throw new Error('No email with PDF found');

    const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
    const parts = msg.data.payload.parts || [];

    const pdfPart = findPdfPart(parts);
    if (!pdfPart || !pdfPart.body || !pdfPart.body.attachmentId) {
      throw new Error('No valid PDF attachment found');
    }

    const attachment = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: message.id,
      id: pdfPart.body.attachmentId,
    });

    const data = Buffer.from(attachment.data.data, 'base64');
    const pdfText = await pdfParse(data);

    return {
      subject: msg.data.payload.headers.find(h => h.name === 'Subject')?.value || '',
      from: msg.data.payload.headers.find(h => h.name === 'From')?.value || '',
      body: pdfText.text,
    };
  } catch (err) {
    console.error('📩 Gmail API Error:', err.message);
    throw err;
  }
}

module.exports = { fetchRealEmailAndParsePDF };
