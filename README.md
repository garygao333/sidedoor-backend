# Merg

AI-powered deep search that finds content across hidden corners of the internet using intelligent agents.

## Overview

Merg is an advanced search platform that deploys AI agents to navigate and discover content across the web that traditional search engines can't reach. Using sophisticated web crawling, natural language processing, and intelligent navigation, Merg provides a seamless search experience with a Perplexity-style chat interface and Netflix-inspired discovery UI.

The platform specializes in finding hard-to-locate content like early releases, research papers, books, and media by intelligently navigating mirror sites, handling pop-ups, and verifying content quality before delivery.

## Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom animated components with WebGL effects
- **Authentication**: Firebase integration
- **Features**: Real-time chat interface, content discovery grid, responsive design

### Backend
- **API**: FastAPI with async support
- **Search Engine**: LangGraph-based multi-agent system
- **AI Models**: OpenAI GPT-4/GPT-3.5 with LangChain integration
- **Web Automation**: Playwright for headless browsing
- **Search**: DuckDuckGo integration with custom crawling
- **Storage**: Google Cloud Storage with local downloads support

### Infrastructure
- **Task Queue**: Ray for distributed processing
- **Database**: Redis for caching and job management
- **Containerization**: Docker with docker-compose
- **Monitoring**: Real-time WebSocket updates

## Features

### 🔍 **Intelligent Search**
- Multi-agent AI system that reasons about search queries
- Automatic navigation of complex mirror sites and archives
- Smart pop-up detection and handling
- Content verification and quality assessment

### 🎯 **Discovery Interface**
- Netflix-style content discovery with trending items
- TMDB integration for movie and TV show metadata
- Book and article recommendations
- Advanced filtering and search capabilities

### 💬 **Interactive Chat**
- Perplexity-style conversational search interface
- Real-time streaming of search progress
- WebSocket-based live updates
- Markdown rendering for rich responses

### 🚀 **Modern UI/UX**
- Beautiful animations and transitions
- Custom WebGL background effects
- Responsive design for all devices
- Dark theme with purple accent colors

### 📊 **Quality Assurance**
- Automatic content verification
- User feedback system for continuous improvement
- Download quality assessment
- Safe, pop-up-free content delivery

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+
- Docker and Docker Compose
- OpenAI API key

### 1. Environment Setup

Create a `.env` file in the backend directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
GCS_BUCKET=your_gcs_bucket_name
GOOGLE_APPLICATION_CREDENTIALS=gcs_key.json
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
playwright install chromium
```

### 3. Frontend Setup

```bash
cd frontend
pnpm install
```

### 4. Start Services

```bash
# Start Redis and PostgreSQL
docker-compose up -d redis postgres

# Start backend API (from backend directory)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Start frontend (from frontend directory)
pnpm dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Project Structure

```
├── backend/                 # FastAPI backend
│   ├── main.py             # Main API server
│   ├── inference.py        # AI search engine
│   ├── requirements.txt    # Python dependencies
│   ├── api/                # API modules
│   ├── services/           # Business logic services
│   └── data/               # Data storage
├── frontend/               # Next.js frontend
│   ├── app/                # App router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── discover/       # Discovery page
│   │   ├── about/          # About page
│   │   └── page.tsx        # Home page
│   ├── contexts/           # React contexts
│   ├── lib/                # Utility libraries
│   └── public/             # Static assets
├── scripts/                # Setup and utility scripts
├── docker-compose.yml      # Docker services
├── Dockerfile              # Container configuration
└── README.md              # This file
```

## Development

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
pnpm test
```

### Code Quality

The project uses modern development practices:
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Tailwind CSS for styling
- Component-based architecture

### API Endpoints

- `POST /api/ask` - Start a new search job
- `GET /api/poll/{job_id}` - Check job status
- `WebSocket /ws/{job_id}` - Real-time updates
- `POST /api/feedback` - Submit user feedback

## Technology Stack

### Frontend Technologies
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons
- **OGL**: WebGL graphics library for effects
- **SWR**: Data fetching and caching
- **React Markdown**: Markdown rendering

### Backend Technologies
- **FastAPI**: Modern Python web framework
- **LangChain**: AI/ML workflow orchestration
- **LangGraph**: Multi-agent workflow system
- **OpenAI**: GPT models for language processing
- **Playwright**: Web automation and scraping
- **Ray**: Distributed computing framework
- **DuckDuckGo Search**: Web search integration

### Infrastructure
- **Docker**: Containerization
- **Redis**: Caching and job queues
- **PostgreSQL**: Primary database
- **Google Cloud Storage**: File storage
- **WebSockets**: Real-time communication

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check our documentation
- Join our community discussions

---

**Note**: This project is for educational and research purposes. Please ensure compliance with all applicable laws and terms of service when using web scraping capabilities.
