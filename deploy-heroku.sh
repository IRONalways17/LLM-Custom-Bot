#!/bin/bash

echo "🚀 RAM Chaecho "Setting environment variables..."
echo "Please set your GEMINI_API_KEY manually:"
echo "heroku config:set GEMINI_API_KEY=your_api_key_here -a $APP_NAME"ot - Quick Heroku Deployment"
echo "========================================"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku first:"
    heroku login
fi

# Get app name from user
read -p "📝 Enter your Heroku app name: " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "❌ App name cannot be empty"
    exit 1
fi

echo "🏗️ Creating Heroku app: $APP_NAME"
heroku create $APP_NAME

echo "🔑 Setting environment variables..."
echo "⚠️  IMPORTANT: Please set your GEMINI_API_KEY manually:"
echo "heroku config:set GEMINI_API_KEY=your_api_key_here -a $APP_NAME"
echo ""
echo "Setting NODE_ENV..."
heroku config:set NODE_ENV=production -a $APP_NAME

echo "📦 Preparing for deployment..."
if [ ! -d ".git" ]; then
    git init
fi

git add .
git commit -m "Deploy RAM Chatbot to Heroku" || echo "No changes to commit"

echo "🚀 Deploying to Heroku..."
heroku git:remote -a $APP_NAME
git push heroku main

echo "✅ Deployment complete!"
echo "🌐 Opening your app..."
heroku open -a $APP_NAME

echo ""
echo "🎉 Your RAM Chatbot is now live!"
echo "📱 App URL: https://$APP_NAME.herokuapp.com"
echo "📊 View logs: heroku logs --tail -a $APP_NAME"
