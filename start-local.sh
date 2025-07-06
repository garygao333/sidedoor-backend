#!/bin/bash

# SideDoor AI Local Development Start (No Docker Required)

echo "🚀 Starting SideDoor AI (Local Development Mode)..."

# Check if Redis is available locally
if ! command -v redis-server &> /dev/null; then
    echo "📦 Installing Redis via Homebrew..."
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew not found. Please install Homebrew first:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    brew install redis
fi

# Start Redis locally
echo "🔴 Starting Redis..."
redis-server --daemonize yes --port 6379

# Check if Python virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "🐍 Setting up Python virtual environment..."
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
export REDIS_URL="redis://localhost:6379"
export DATABASE_URL="sqlite:///./sidedoor.db"  # Use SQLite instead of PostgreSQL
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

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

# Start a simplified crawler worker (without Playwright for now)
echo "🤖 Starting simplified crawler worker..."
cd backend/workers
python -c "
import redis
import json
import time
import uuid

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Create consumer group
try:
    redis_client.xgroup_create('jobs', 'crawlers', id='0', mkstream=True)
except:
    pass

print('🤖 Mock crawler worker started...')

while True:
    try:
        messages = redis_client.xreadgroup('crawlers', 'mock-worker', {'jobs': '>'}, count=1, block=5000)
        if messages:
            for stream, msgs in messages:
                for msg_id, fields in msgs:
                    job_id = fields['id']
                    query = fields['query']
                    
                    print(f'Processing job: {query}')
                    
                    # Mock search result
                    result = {
                        'title': f'{query} (Demo Result)',
                        'type': 'video',
                        'file_id': str(uuid.uuid4()),
                        'size': 1024*1024*100,  # 100MB
                        'quality': 'HD',
                        'verified': True
                    }
                    
                    # Store result and update status
                    redis_client.lpush(f'results:{job_id}', json.dumps(result))
                    redis_client.hset(f'job:{job_id}', 'status', 'completed')
                    redis_client.hset(f'job:{job_id}', 'completed_at', str(time.time()))
                    
                    # Send update
                    redis_client.xadd(f'updates:{job_id}', {
                        'message': f'Found demo result for: {query}',
                        'timestamp': str(time.time())
                    })
                    
                    redis_client.xack('jobs', 'crawlers', msg_id)
                    print(f'Completed job: {job_id}')
    except KeyboardInterrupt:
        break
    except Exception as e:
        print(f'Worker error: {e}')
        time.sleep(1)
" &
WORKER_PID=$!
cd ../..

# Seed mirror sites
echo "🌱 Seeding mirror sites..."
cd scripts
python seed_mirrors.py
cd ..

echo ""
echo "✅ SideDoor AI is now running in local development mode!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "🧪 Test the API:"
echo "   curl -X POST http://localhost:8000/ask -H 'Content-Type: application/json' -d '{\"q\":\"Interstellar 2014 1080p\"}'"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null  
    kill $WORKER_PID 2>/dev/null
    redis-cli shutdown 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
