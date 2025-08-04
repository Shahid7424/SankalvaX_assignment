// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const parsePdf = require('./parsePdf');
const transformWithGemini = require('./gemini');
const createSalesOrder = require('./netsuite');
const { fetchRealEmailAndParsePDF } = require('./gmailReal');

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 OAuth2 Client Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 🔗 Step 0: Google Auth URL
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent',
  });
  res.redirect(authUrl);
});

// 🔗 Step 1: OAuth Callback
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('❌ No code found');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save to tokens.json
    fs.writeFileSync(path.join(__dirname, 'tokens.json'), JSON.stringify(tokens, null, 2));
    console.log('✅ Tokens saved to tokens.json');
    res.send('✅ Gmail access granted! Now test POST /api/fetch-email');
  } catch (err) {
    console.error('❌ Error saving tokens:', err.message);
    res.status(500).send('Google authentication failed');
  }
});

// 📩 Step 2: Fetch Email with PDF
app.post('/api/fetch-email', async (req, res) => {
  try {
    const emailData = await fetchRealEmailAndParsePDF();
    res.json(emailData);
  } catch (err) {
    console.error('❌ Email fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch email and PDF' });
  }
});

// 📄 Step 3: Extract PO
app.post('/api/extract-po', async (req, res) => {
  try {
    const rawPO = await parsePdf(req.body.email);
    res.json(rawPO);
  } catch (err) {
    console.error('❌ PO parsing error:', err.message);
    res.status(500).json({ error: 'Failed to parse PO' });
  }
});

// 🤖 Step 4: Transform via Gemini
app.post('/api/transform', async (req, res) => {
  try {
    const soJSON = await transformWithGemini(req.body.rawPO);
    res.json(soJSON);
  } catch (err) {
    console.error('❌ Gemini transformation error:', err.message);
    res.status(500).json({ error: 'Gemini transformation failed' });
  }
});

// 📦 Step 5: Create NetSuite Sales Order
app.post('/api/create-sales-order', async (req, res) => {
  try {
    const result = await createSalesOrder(req.body.soJSON);
    res.json(result);
  } catch (err) {
    console.error('❌ NetSuite error:', err.message);
    res.status(500).json({ error: 'NetSuite Sales Order creation failed' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
