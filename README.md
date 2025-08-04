# Gmail to NetSuite Sales Order Converter

This project automates the process of converting Purchase Orders (POs) received via Gmail (as PDF attachments) into structured Sales Orders in NetSuite using OpenAI's GPT model.

---

## 📌 Features

- Gmail OAuth2 integration with token persistence
- Fetches the most recent Gmail email with a PDF attachment
- Parses PDF content to raw PO JSON
- Uses OpenAI (Gemini API) to convert raw PO data into NetSuite Sales Order format
- Creates a Sales Order in NetSuite using REST API and OAuth 1.0a
- Minimal web-based UI (optional), otherwise CLI/Node backend
- Logs each step for visibility and debugging

---

## 🧪 Demo Video

- **Link**: [Watch on Loom](https://www.loom.com/share/bdd40fa3b1d54162bbc3131a36195071?sid=fa20720f-a3ca-46f3-b029-16173affb4be)  

---

## 📁 Project Structure

SankalavaX_Assignment/
├── backend/
│ ├── auth/
│ │ ├── generateAuth.js
│ │ └── googleAuth.js
│ ├── gmailReal.js
│ ├── parsePdf.js
│ ├── gemini.js
│ └── netsuite.js
├── .env.local
├── .gitignore
├── tokens.json
└── README.md



---

## 🛠️ Setup Instructions

1. **Clone the repository:**

```bash
git clone https://github.com/Shahid7424/SankalvaX_assignment.git


# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/oauth2callback

# Gemini/OpenAI
GEMINI_API_KEY=your_gemini_or_openai_api_key

# NetSuite
REALM=your_realm
BASE_URL=https://your_account.suitetalk.api.netsuite.com
CONSUMER_KEY=your_consumer_key
CONSUMER_SECRET=your_consumer_secret
ACCESS_TOKEN=your_access_token
TOKEN_SECRET=your_token_secret

⏱️ Time Taken  /// because my office time is not perfect matched 
Start Date/Time: 2rd August 2025, 10:00 AM IST

End Date/Time: 4th August 2025, 2:00 PM IST

Total Duration: ~2 days

Author:
Shahid Shah
Email: shahshahid121212@gmail.com
GitHub: github.com/shahidshah
