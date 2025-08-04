// backend/gemini.js
const axios = require('axios');

module.exports = async (rawPO) => {
  const prompt = `
Convert this PO data into a valid NetSuite Sales Order JSON:

Raw Purchase Order:
${JSON.stringify(rawPO, null, 2)}

Use these mappings:
- Customer "1186 Test Customer" → ID 3550
- ItemA → ID 1125
- ItemB → ID 1126

Return only JSON, no explanation.
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
      }
    );

    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('Gemini API did not return valid content.');
    }

    const parsed = JSON.parse(content);
    console.log('✅ Gemini response parsed successfully.');
    return parsed;
  } catch (error) {
    console.error('❌ Error in Gemini transformation:', error.message);
    throw error;
  }
};
