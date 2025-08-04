// backend/parsePdf.js
module.exports = async (email) => {
  // For now, return mock data
  // In real implementation, you would parse the actual PDF content from email.body
  
  return {
    poNumber: '9',
    vendor: 'Test Vendor',
    customer: '1186 Test Customer',
    customerId: '3550',
    terms: 'Net 30',
    shipTo: {
      name: 'Test Customer',
      address: 'Shivaji Nagar',
      state: 'Maharashtra',
      country: 'India',
    },
    billTo: {
      name: 'Test Customer',
      address: 'Shivaji Nagar',
      state: 'Maharashtra',
      country: 'India',
    },
    items: [
      {
        name: 'ItemA',
        itemId: '1125',
        quantity: 15,
        rate: 25.0,
        amount: 375.0,
      },
      {
        name: 'ItemB',
        itemId: '1126',
        quantity: 10,
        rate: 40.0,
        amount: 400.0,
      },
    ],
    total: 775.0,
    extractedFrom: email.subject,
    extractedAt: new Date().toISOString(),
  };
};