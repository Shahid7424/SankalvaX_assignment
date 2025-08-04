const express = require('express');
const router = express.Router();
const { fetchRealEmailAndParsePDF } = require('../gmailReal'); // ✅ Import real Gmail fetch logic

router.get('/fetch-po', async (req, res) => {
  try {
    console.log('📥 Using real Gmail fetch...');
    
    const emailData = await fetchRealEmailAndParsePDF();

    return res.json({
      message: 'Successfully fetched and parsed PDF email',
      email: emailData,
    });
  } catch (error) {
    console.error('❌ Error fetching PO:', error.message);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

module.exports = router;
