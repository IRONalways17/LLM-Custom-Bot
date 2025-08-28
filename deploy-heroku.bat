@echo off
title RAM Chatbot - Herecho Setting environment variables...
echo Please set your GEMINI_API_KEY manually:
echo heroku config:set GEMINI_API_KEY=your_api_key_here -a %APP_NAME%u Deployment

echo 🚀 RAM Chatbot - Quick Heroku Deployment
echo ========================================

REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Heroku CLI not found. Please install it first:
    echo    https://devcenter.heroku.com/articles/heroku-cli
    pause
    exit /b 1
)

REM Check if user is logged in
heroku auth:whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please login to Heroku first:
    heroku login
)

REM Get app name from user
set /p APP_NAME="📝 Enter your Heroku app name: "

if "%APP_NAME%"=="" (
    echo ❌ App name cannot be empty
    pause
    exit /b 1
)

echo 🏗️ Creating Heroku app: %APP_NAME%
heroku create %APP_NAME%

echo 🔑 Setting environment variables...
echo ⚠️  IMPORTANT: Please set your GEMINI_API_KEY manually:
echo heroku config:set GEMINI_API_KEY=your_api_key_here -a %APP_NAME%
echo.
echo Setting NODE_ENV...
heroku config:set NODE_ENV=production -a %APP_NAME%

echo 📦 Preparing for deployment...
if not exist ".git" (
    git init
)

git add .
git commit -m "Deploy RAM Chatbot to Heroku"

echo 🚀 Deploying to Heroku...
heroku git:remote -a %APP_NAME%
git push heroku main

echo ✅ Deployment complete!
echo 🌐 Opening your app...
heroku open -a %APP_NAME%

echo.
echo 🎉 Your RAM Chatbot is now live!
echo 📱 App URL: https://%APP_NAME%.herokuapp.com
echo 📊 View logs: heroku logs --tail -a %APP_NAME%

pause
