// backend/netsuite.js
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const axios = require('axios');

module.exports = async (soJSON) => {
  const oauth = OAuth({
    consumer: {
      key: process.env.NETSUITE_CONSUMER_KEY,
      secret: process.env.NETSUITE_CONSUMER_SECRET,
    },
    signature_method: 'HMAC-SHA256',
    hash_function(base_string, key) {
      return crypto.createHmac('sha256', key).update(base_string).digest('base64');
    },
  });

  const token = {
    key: process.env.NETSUITE_ACCESS_TOKEN,
    secret: process.env.NETSUITE_TOKEN_SECRET,
  };

  const requestData = {
    url: `${process.env.NETSUITE_BASE_URL}/salesorder`,
    method: 'POST',
  };

  const authHeader = oauth.toHeader(oauth.authorize(requestData, token)).Authorization;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `${authHeader},realm="${process.env.NETSUITE_REALM}"`,
  };

  try {
    const response = await axios.post(requestData.url, soJSON, { headers });
    console.log('✅ Sales Order created in NetSuite.');
    return response.data;
  } catch (error) {
    console.error('❌ NetSuite Sales Order creation failed:', error.response?.data || error.message);
    throw error;
  }
};
