#!/bin/bash

# SideDoor AI Quick Start Script

echo "🚀 Starting SideDoor AI..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start Redis and PostgreSQL
echo "📦 Starting Redis and PostgreSQL..."
docker-compose up -d redis postgres

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# Check if Python virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Setting up Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Start the backend API
echo "🔧 Starting backend API..."
cd backend
source venv/bin/activate
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    if command -v pnpm &> /dev/null; then
        pnpm install
    elif command -v yarn &> /dev/null; then
        yarn install
    else
        npm install
    fi
    cd ..
fi

# Start the frontend
echo "🎨 Starting frontend..."
cd frontend
if command -v pnpm &> /dev/null; then
    pnpm dev &
elif command -v yarn &> /dev/null; then
    yarn dev &
else
    npm run dev &
fi
FRONTEND_PID=$!
cd ..

# Start a crawler worker
echo "🤖 Starting crawler worker..."
cd backend/workers
python worker.py &
WORKER_PID=$!
cd ../..

# Seed mirror sites
echo "🌱 Seeding mirror sites..."
cd scripts
python seed_mirrors.py
cd ..

echo ""
echo "✅ SideDoor AI is now running!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $WORKER_PID 2>/dev/null
    docker-compose down
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
