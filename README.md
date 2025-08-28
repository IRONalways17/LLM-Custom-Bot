# RAM AI Chatbot

A production-ready multimodal AI chatbot built with React, Node.js, and Google Gemini API. Features intelligent conversation capabilities with support for text, image, video, and audio processing.

## Live Demo

**Deployed Application:** [https://ram-bot-9f396ea8cd8c.herokuapp.com/](https://ram-bot-9f396ea8cd8c.herokuapp.com/)

## Features

- **Multimodal AI**: Process text, images, videos, and audio files
- **Real-time Chat**: Instant responses with persistent chat history
- **Modern UI**: React frontend with animated components and responsive design
- **Production Ready**: Deployed on Heroku with optimized build process
- **File Upload**: Drag-and-drop file support with preview functionality

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Multer
- **AI Integration**: Google Gemini 1.5 Pro API
- **Deployment**: Heroku with unified server architecture
- **Storage**: Browser localStorage for chat persistence

## Architecture

```
React Frontend → Node.js Server → Google Gemini API
     ↓               ↓               ↓
  Port 3000      Express API    AI Processing
```

## Quick Start

### Prerequisites

- Node.js 18+
- Google Gemini API key

### Installation

```bash
git clone https://github.com/IRONalways17/LLM-Custom-Bot.git
cd LLM-Custom-Bot
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey) or [Open Router](https://openrouter.ai/) and never commit it to version control.

### Development

```bash
# Start development server
npm start
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
# Build frontend
npm run build:frontend

# Start production server
npm start
```

## API Endpoints

- `GET /` - Serve frontend application
- `POST /api/chat` - Process chat messages and file uploads
- `GET /assets/*` - Serve static frontend assets

## File Upload Support

Supported file types:
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM, MOV
- **Audio**: MP3, WAV, M4A

Maximum file size: 10MB per file

## Project Structure

```
├── frontend/           # React application
│   ├── src/
│   │   ├── App.jsx     # Main application component
│   │   └── components/ # UI components
├── server.js          # Unified production server
├── package.json       # Root dependencies
└── Procfile           # Heroku deployment config
```

## Deployment

### Heroku Deployment

1. Create a Heroku app:
```bash
heroku create your-app-name
```

2. Set environment variables:
```bash
heroku config:set GEMINI_API_KEY=your_actual_api_key -a your-app-name
heroku config:set NODE_ENV=production -a your-app-name
```

3. Deploy:
```bash
git push heroku main
```

### Security Notes

- Never commit `.env` files or API keys to version control
- Use environment variables for all sensitive configuration
- The `.gitignore` file is configured to exclude sensitive files
- API keys are set as Heroku config vars, not in code

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Author

**AARYAN** - [GitHub Profile](https://github.com/IRONalways17)
