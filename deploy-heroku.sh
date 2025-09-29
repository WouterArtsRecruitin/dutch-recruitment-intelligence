#!/bin/bash
# HEROKU Deployment Script
echo "🚀 Deploying to heroku..."

git init
heroku create dutch-recruitment-webhooks
git add .
git commit -m "Initial deployment"
git push heroku main

heroku config:set NODE_ENV=production
heroku config:set WEBHOOK_SECRET=your-secret-key

echo "✅ Deployment compleet!"
echo "🌐 App URL: https://dutch-recruitment-webhooks.herokuapp.com"
