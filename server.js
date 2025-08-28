const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads (memory storage for Heroku)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'RAM Chatbot Server is running',
    timestamp: new Date().toISOString()
  });
});

// Chat endpoint - handles both text and multimodal inputs
app.post('/api/chat', upload.array('files'), async (req, res) => {
  try {
    console.log('🔵 Received chat request');
    const { message = '' } = req.body;
    const files = req.files || [];

    console.log('📝 Message:', message);
    console.log('📁 Files:', files.length);

    if (!message && files.length === 0) {
      console.log('❌ No message or files provided');
      return res.status(400).json({ error: 'Message or files are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ No API key configured');
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Prepare content for Gemini
    const parts = [];
    
    // Add text message if provided
    if (message.trim()) {
      parts.push({ text: message });
    }

    // Process uploaded files
    for (const file of files) {
      try {
        console.log('🔄 Processing file:', file.originalname, file.mimetype);
        
        // Convert buffer to base64
        const base64Data = file.buffer.toString('base64');
        
        // Add file to parts based on type
        if (file.mimetype.startsWith('image/')) {
          parts.push({
            inlineData: {
              mimeType: file.mimetype,
              data: base64Data
            }
          });
          console.log('✅ Added image file to request');
        } else if (file.mimetype.startsWith('video/')) {
          parts.push({
            inlineData: {
              mimeType: file.mimetype,
              data: base64Data
            }
          });
          console.log('✅ Added video file to request');
        } else if (file.mimetype.startsWith('audio/')) {
          console.log('⚠️ Audio processing might not be supported by current model');
          parts.push({
            inlineData: {
              mimeType: file.mimetype,
              data: base64Data
            }
          });
        } else {
          console.log('❌ Unsupported file type:', file.mimetype);
        }
      } catch (fileError) {
        console.error('❌ Error processing file:', file.originalname, fileError);
      }
    }

    console.log('🔄 Sending to Gemini with', parts.length, 'parts');
    
    // Generate content using Gemini with multimodal input
    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini response received');
    res.json({ reply: text });

  } catch (error) {
    console.error('❌ Error generating response:', error);
    
    if (error.message.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    if (error.message.includes('quota')) {
      return res.status(429).json({ error: 'API quota exceeded' });
    }

    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 RAM Chatbot Server running on port ${PORT}`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY environment variable is not set!');
  } else {
    console.log('✅ Gemini API key loaded successfully');
  }
});
