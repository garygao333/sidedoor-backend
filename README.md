# SideDoor AI

Deep search for your favorite media on the grey side of the internet.

## Overview

SideDoor AI deploys AI agents to navigate mirror sites and locate hard-to-get content like early movie releases, paywalled articles, and unreleased books. Features a Perplexity-style chat interface and Netflix-like discovery UI.

## Architecture

- **Frontend**: Next.js 14 with Tailwind CSS
- **Backend**: FastAPI with Redis Streams
- **Crawlers**: Docker + Playwright with WebDancer-32B
- **Storage**: File serving with range support

## Quick Start

1. **Setup Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   docker-compose up redis postgres
   uvicorn api.main:app --reload
   ```

2. **Setup Frontend**:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

3. **Run Crawler Workers**:
   ```bash
   cd backend/workers
   docker build -t sidedoor-crawler .
   docker run sidedoor-crawler
   ```

## Features

- 🔍 **Smart Search**: AI agents navigate complex mirror sites
- 🚫 **Ad Blocking**: Automatic pop-up and ad handling
- ✅ **Quality Check**: Verify content before delivery
- 📺 **Clean Streaming**: No sketchy redirects or pop-ups
- 📊 **Feedback Loop**: User feedback improves agent performance

## Tech Stack

- Next.js, React, Tailwind CSS, SWR
- FastAPI, Redis, PostgreSQL
- Playwright, Docker
- WebDancer-32B for navigation AI
- ffprobe/pdfinfo for quality verification
