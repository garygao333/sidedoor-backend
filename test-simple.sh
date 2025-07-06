#!/bin/bash

# Simple test script for SideDoor AI

echo "🧪 Testing SideDoor AI..."

# Test if backend is running
echo "1. Testing backend health..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start it first."
    exit 1
fi

# Test search endpoint
echo "2. Testing search functionality..."
RESPONSE=$(curl -s -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"q":"Interstellar 2014 1080p"}')

if echo "$RESPONSE" | grep -q "job_id"; then
    echo "✅ Search endpoint working"
    JOB_ID=$(echo "$RESPONSE" | grep -o '"job_id":"[^"]*"' | cut -d'"' -f4)
    echo "   Job ID: $JOB_ID"
    
    # Wait a moment and check job status
    echo "3. Checking job status..."
    sleep 3
    STATUS_RESPONSE=$(curl -s http://localhost:8000/poll/$JOB_ID)
    
    if echo "$STATUS_RESPONSE" | grep -q "status"; then
        echo "✅ Job polling working"
        echo "   Status: $(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
    else
        echo "❌ Job polling failed"
    fi
else
    echo "❌ Search endpoint failed"
    echo "   Response: $RESPONSE"
fi

echo ""
echo "🌐 Open http://localhost:3000 to test the frontend"
echo "📚 API docs available at http://localhost:8000/docs"
