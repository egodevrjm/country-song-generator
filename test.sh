#!/bin/bash

echo "🎸 Country Song Generator - Test Launch"
echo "======================================"

# Check if API key is in .env
if [ -f .env ] && grep -q "CLAUDE_API_KEY=.*[^=]" .env; then
    echo "✅ API key found in .env file"
else
    echo "⚠️  No API key found in .env file"
    echo "   You can enter it in the web interface"
fi

echo ""
echo "Starting server..."
echo ""

npm start
