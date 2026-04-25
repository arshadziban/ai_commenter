# LinkedIn AI Comment Extension

Generate professional and friendly AI comments for LinkedIn posts.

## Setup

### 1. Backend Server

```bash
cd backend
npm install
node server.js
```

Or on Windows, double-click `backend/start.bat`

The server will run on http://localhost:5000

### 2. Browser Extension

1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. The extension is now installed!

## Usage

1. Make sure the backend server is running
2. Go to LinkedIn
3. Click on any comment box under a post
4. Click the "✨ AI Comment" button that appears
5. Choose from Professional or Friendly comments
6. Click "Copy" to use the comment

## Features

- 💼 Professional comments - Formal, business-appropriate
- 😊 Friendly comments - Warm, conversational with emojis
- 📋 One-click copy to clipboard
- ✨ Clean, modern UI

## Requirements

- Node.js installed
- OpenRouter API key (already configured in `.env`)
- Chrome or Edge browser
