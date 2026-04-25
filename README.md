# LinkedIn AI Comment Extension

Generate concise, context-aware LinkedIn comments with one click.

## Overview

This project adds a browser extension that detects LinkedIn comment boxes and generates AI-powered replies using a local backend service. It is designed to help you write professional or friendly comments faster without leaving the page.

## Features

- Two comment styles: Professional and Friendly
- Automatic post text extraction from LinkedIn feeds
- Language detection for English and Bengali input
- Copy-to-clipboard support
- Lightweight browser extension UI

## Project Structure

- `backend/` - Express server that generates comments through OpenRouter
- `extension/` - Chrome/Edge extension that injects the AI comment button into LinkedIn

## Requirements

- Node.js 18 or newer
- An OpenRouter API key in the backend environment
- Chrome or Edge browser

## Backend Setup

1. Open a terminal in the `backend` folder.
2. Install dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
node server.js
```
## Extension Setup

1. Open Chrome or Edge and go to `chrome://extensions/`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `extension` folder.

## Usage

1. Start the backend server.
2. Open LinkedIn and find a post.
3. Click inside a comment box under the post.
4. Use the AI Comment button to choose Professional or Friendly.
5. Copy the generated comment and paste it into LinkedIn.


## Troubleshooting

- If no button appears, refresh LinkedIn after loading the extension.
- If generation fails, confirm the backend server is running on port 5000.
- If the backend returns an error, verify the OpenRouter API key is configured correctly.