# HealthMate AI

A personal health consultation app powered by AI-driven conversations and automated workflows. Users can chat with an AI health consultant and receive personalized health reports via email.

## 🚀 Features

- Interactive AI health consultation chat interface
- Natural language processing for health conversations
- Automated health report generation and email delivery
- Responsive design for all devices
- Secure data handling and privacy protection

## 📂 Project Structure

├── frontend/
│ ├── index.html
│ ├── style.css 
│ └── script.js 
├── workflows/
│ └── health-consultation-workflow.json 
├── assets/
│ ├── sample-health-report.pdf 
│ └── n8n-project-demo.mp4 # System demonstration (old UI)
└── README.md

## 🚀 **Setup Instructions**

### **Step 1: n8n Installation**
1. Install n8n: `npm install n8n -g`
2. Start n8n: `n8n start`
3. Access: `http://localhost:5678`

### **Step 2: Import Workflow**
1. In n8n interface, go to **Workflows** → **Import from File**
2. Upload `health-consultation-workflow.json`
3. Click **Save**

### **Step 3: Configure Environment Variables**
Set these environment variables in your n8n instance:

GEMINI_API_KEY=your_gemini_api_key_here

### **Step 4: Configure Google Sheets (Optional)**
1. Create a new Google Sheet with columns: `Timestamp`, `User Email`, `User Message`, `AI Response`
2. Copy the sheet URL
3. In n8n workflow, update the Google Sheets node with your sheet URL
4. Set up Google Sheets API credentials in n8n

**Note**: If you don't want conversation logging, you can disable or delete the "Append row in sheet" node from the workflow.

### **Step 4: Set Up Credentials**
1. **Google Gemini API**: Add your API key in n8n Credentials
2. **Gmail**: Configure OAuth2 or App Password for email sending
3. **Google Sheets**: Set up Google Sheets API access (optional)

### **Step 5: Configure Webhook**
1. Activate the workflow in n8n
2. Note the webhook URL (usually: `http://localhost:5678/webhook-test/health-chat`)
3. Update `API_URL` in `script.js` with your webhook URL


## 🔧 **Configuration Requirements**

### **Required API Keys:**
- **Google Gemini API**: For AI conversation generation
- **Gmail API**: For sending health reports via email

### **Optional Integrations:**
- **Google Sheets**: For conversation logging

### Backend Setup (n8n)
1. Install and configure n8n on your server or local machine
2. Import the workflow from `workflows/health-consultation-workflow.json`
3. Configure your API credentials (Google Gemini, Gmail, Sheet)
4. Activate the workflow to start the webhook listener
5. Note your n8n webhook URL

### Frontend Setup
1. Clone this repository
2. Update the API URL in `scripts/script.js`:
const API_URL = 'YOUR_N8N_WEBHOOK_URL';
3. Open `index.html` in a web browser or deploy to a hosting service

## 🔧 Configuration

After deploying the frontend, ensure:
- Your n8n backend is running and accessible
- CORS is properly configured in n8n for your domain
- API URL in the frontend points to your n8n webhook
- All necessary API credentials are configured in n8n

## 🎯 Usage

1. Visit your deployed frontend URL
2. Click "Get Started" to begin a health consultation
3. Enter your email address
4. Chat with the AI health consultant
5. Receive your personalized health report via email

## 🔒 Privacy & Security

- No personal health data is stored on the frontend
- All processing happens through secure n8n workflows
- Reports are delivered directly via encrypted email
- User sessions are temporary and not persisted

## 🤝 Contributing

This is a portfolio project demonstrating AI workflow automation and frontend development skills.

## 📞 Contact

For live demonstrations or questions about this project, please contact me.

---

**Note:** This is a showcase project. The demo video shows an earlier version of the interface.
