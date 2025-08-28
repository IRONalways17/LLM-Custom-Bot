@echo off
echo 🚀 Deploying RAM Chatbot to Heroku...

REM Build the frontend
echo 📦 Building frontend...
cd frontend
call npm install
call npm run build
cd ..

echo ✅ Frontend built successfully!
echo 🔗 Ready for Heroku deployment!

REM Instructions for manual deployment
echo.
echo 📋 Next steps:
echo 1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
echo 2. Login: heroku login
echo 3. Create app: heroku create your-ram-chatbot
echo 4. Set environment variable: heroku config:set GEMINI_API_KEY=your_api_key
echo 5. Deploy: git push heroku main

pause
