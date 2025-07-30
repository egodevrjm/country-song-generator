#!/bin/bash

# Alex Wilson Country Song Generator - Quick Setup Script

echo "🎸 Welcome to Alex Wilson Country Song Generator Setup! 🎸"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    echo "PORT=3000" > .env
    echo "✅ .env file created with default PORT=3000"
else
    echo "✅ .env file already exists"
fi

# Create song-history.json if it doesn't exist
if [ ! -f song-history.json ]; then
    echo "[]" > song-history.json
    echo "✅ Created song-history.json"
fi

echo ""
echo "🎉 Setup complete! 🎉"
echo ""
echo "To start the server, run:"
echo "  npm start"
echo ""
echo "Then open your browser to:"
echo "  http://localhost:3000"
echo ""
echo "Don't forget to add your Claude API key in the Settings!"
echo ""
echo "Happy songwriting! 🎵"
