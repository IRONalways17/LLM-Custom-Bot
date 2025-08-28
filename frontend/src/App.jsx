import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Paperclip, Image, Video, Mic, X } from 'lucide-react';
import ShinyText from './components/ShinyText';
import ElectricBorder from './components/ElectricBorder';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('ram-chat-history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ram-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    setShowFileMenu(false);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = (accept) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!inputMessage.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      files: selectedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      })),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    const filesToSend = [...selectedFiles];
    setSelectedFiles([]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', inputMessage);
      
      // Add files with the correct field name expected by FastAPI
      filesToSend.forEach((file) => {
        formData.append('files', file);
      });

      console.log('Sending FormData with', filesToSend.length, 'files');

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.reply,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('ram-chat-history');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-white/20 text-center">
        <ShinyText 
          text="RAM" 
          className="text-4xl md:text-6xl font-bold mb-2"
          speed={3}
        />
        <p className="text-white text-sm md:text-base opacity-80">AARYAN</p>
        <button
          onClick={clearChat}
          className="mt-2 text-xs text-white/60 hover:text-white/80 transition-colors"
        >
          Clear Chat
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  {message.files && message.files.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {message.files.map((file, fileIndex) => (
                        <div key={fileIndex} className="flex items-center space-x-2">
                          {file.type.startsWith('image/') && (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="max-w-32 max-h-32 rounded border"
                            />
                          )}
                          {file.type.startsWith('video/') && (
                            <video
                              src={file.url}
                              controls
                              className="max-w-32 max-h-32 rounded border"
                            />
                          )}
                          {file.type.startsWith('audio/') && (
                            <audio
                              src={file.url}
                              controls
                              className="w-full max-w-48"
                            />
                          )}
                          <span className={`text-xs ${
                            message.sender === 'user' ? 'text-black/60' : 'text-white/60'
                          }`}>
                            {file.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 opacity-60 ${
                    message.sender === 'user' ? 'text-black/60' : 'text-white/60'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {messages.length === 0 && (
            <div className="text-center text-white/60 mt-20">
              <p className="text-lg mb-2">Welcome to RAM AI Chatbot</p>
              <p className="text-sm">Start a conversation by typing a message below.</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/20">
          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg border border-white/20"
                >
                  {file.type.startsWith('image/') && <Image className="w-4 h-4" />}
                  {file.type.startsWith('video/') && <Video className="w-4 h-4" />}
                  {file.type.startsWith('audio/') && <Mic className="w-4 h-4" />}
                  <span className="text-sm text-white/80 max-w-32 truncate">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={sendMessage} className="flex gap-2">
            {/* File Input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* File Attachment Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFileMenu(!showFileMenu)}
                className="p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* File Menu */}
              {showFileMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-black border border-white/20 rounded-lg overflow-hidden shadow-lg">
                  <button
                    type="button"
                    onClick={() => openFileDialog('image/*')}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors w-full text-left"
                  >
                    <Image className="w-4 h-4" />
                    <span className="text-sm">Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openFileDialog('video/*')}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors w-full text-left"
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-sm">Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openFileDialog('audio/*')}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors w-full text-left"
                  >
                    <Mic className="w-4 h-4" />
                    <span className="text-sm">Audio</span>
                  </button>
                </div>
              )}
            </div>
            <ElectricBorder 
              color="#FFFFFF" 
              speed={1.5} 
              chaos={0.8} 
              thickness={1}
              className="flex-1"
              style={{ borderRadius: '0.5rem' }}
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="w-full p-3 bg-transparent text-white placeholder-white/50 outline-none resize-none"
                style={{ borderRadius: '0.5rem' }}
              />
            </ElectricBorder>
            
            <button
              type="submit"
              disabled={(!inputMessage.trim() && selectedFiles.length === 0) || isLoading}
              className="px-4 py-3 bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
