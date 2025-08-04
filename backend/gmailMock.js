// backend/gmailMock.js
exports.fetchMockEmail = async (config) => {
    return {
      subject: 'Purchase Order #9 - Test Customer',
      sender: config.gmailSender,
      senderEmail: config.gmailSenderEmail,
      body: 'Please find attached Purchase Order #9 for immediate processing.',
      attachments: ['Purchase_Order_PO9.pdf'],
      receivedDate: new Date().toISOString(),
    };
  };
  