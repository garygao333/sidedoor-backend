#!/bin/bash

# SideDoor AI Setup Script

echo "🚀 Setting up SideDoor AI..."

# Create data directories
mkdir -p data/downloads
mkdir -p data/logs

# Setup backend
echo "📦 Setting up backend..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup frontend
echo "🎨 Setting up frontend..."
cd ../frontend
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start services: docker-compose up -d redis postgres"
echo "2. Start backend: cd backend && uvicorn api.main:app --reload"
echo "3. Start frontend: cd frontend && pnpm dev"
echo "4. Start crawler: cd backend/workers && python worker.py"
