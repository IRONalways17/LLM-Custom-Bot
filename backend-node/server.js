const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model - use gemini-1.5-pro for multimodal capabilities
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'RAM Chatbot Node.js Service is running' });
});

// Generate response endpoint
app.post('/generate', async (req, res) => {
  try {
    console.log('🔵 Received request:', { 
      prompt: req.body.prompt, 
      fileCount: req.body.files ? req.body.files.length : 0 
    });
    
    const { prompt, files = [] } = req.body;

    if (!prompt && files.length === 0) {
      console.log('❌ No prompt or files provided');
      return res.status(400).json({ error: 'Prompt or files are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ No API key configured');
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Prepare content for Gemini
    const parts = [];
    
    // Add text prompt if provided
    if (prompt) {
      parts.push({ text: prompt });
    }

    // Process uploaded files
    for (const file of files) {
      try {
        console.log('🔄 Processing file:', file.filename, file.content_type);
        
        // Add file to parts based on type
        if (file.content_type.startsWith('image/')) {
          parts.push({
            inlineData: {
              mimeType: file.content_type,
              data: file.content
            }
          });
          console.log('✅ Added image file to request');
        } else if (file.content_type.startsWith('video/')) {
          parts.push({
            inlineData: {
              mimeType: file.content_type,
              data: file.content
            }
          });
          console.log('✅ Added video file to request');
        } else if (file.content_type.startsWith('audio/')) {
          // Note: Audio might not be supported by gemini-pro-vision
          console.log('⚠️ Audio processing might not be supported by current model');
          parts.push({
            inlineData: {
              mimeType: file.content_type,
              data: file.content
            }
          });
        } else {
          console.log('❌ Unsupported file type:', file.content_type);
        }
      } catch (fileError) {
        console.error('❌ Error processing file:', file.filename, fileError);
      }
    }

    console.log('🔄 Sending to Gemini with', parts.length, 'parts');
    
    // Generate content using Gemini with multimodal input
    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini response:', text.substring(0, 100) + '...');
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

app.listen(PORT, () => {
  console.log(`Node.js service running on port ${PORT}`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY environment variable is not set!');
  } else {
    console.log('✅ Gemini API key loaded successfully');
  }
});
