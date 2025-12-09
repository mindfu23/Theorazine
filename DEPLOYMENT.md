# Theorazine - Netlify Deployment Guide

## Quick Deploy to Netlify

### Option 1: One-Click Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/mindfu23/Theorazine)

### Option 2: Manual Setup

1. **Connect Repository:**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect to GitHub and select `mindfu23/Theorazine`

2. **Build Settings:**
   - Build command: `echo 'Static site - no build required'`
   - Publish directory: `.` (root)
   - The `netlify.toml` file will handle the rest

3. **Environment Variables:**
   Set in Netlify Dashboard > Site settings > Environment variables:
   ```
   PERPLEXITY_API_KEY = your_perplexity_api_key_here
   ```

4. **Deploy:**
   - Click "Deploy site"
   - Your site will be live in minutes!

## Features Included

✅ **Static Site Hosting** - Fast global CDN delivery  
✅ **Serverless Functions** - Perplexity AI integration via `/netlify/functions/perplexity`  
✅ **Service Worker** - Offline caching for better performance  
✅ **Security Headers** - CSP, XSS protection, and more  
✅ **Cache Optimization** - Static assets cached for 1 year  
✅ **SPA Support** - Proper routing for single-page app behavior  

## Live Site Features

- 🧮 **Mathematical Conspiracy Analysis** - Based on Dr. Grimes' research
- 📊 **Interactive Charts** - Visualize probability decay over time  
- 🧠 **AI-Powered Analysis** - Perplexity Sonar Reasoning integration
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ⚡ **Performance Optimized** - Fast loading with caching and service worker

## API Configuration

The site uses Perplexity AI's `sonar-reasoning` model for enhanced conspiracy theory analysis. Make sure to:

1. Get an API key from [Perplexity](https://www.perplexity.ai/)
2. Add it to Netlify environment variables as `PERPLEXITY_API_KEY`
3. The function will automatically use the key for AI-powered analysis

## Security

- All API keys are server-side only (never exposed to browser)
- CSP headers protect against XSS attacks
- Secure HTTPS-only deployment
- Input sanitization and validation

Ready to analyze conspiracy theories with math and AI! 🔍📊