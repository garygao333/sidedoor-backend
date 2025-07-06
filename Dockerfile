# syntax=docker/dockerfile:1
FROM python:3.11-slim

# Prevents Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1 
WORKDIR /app

# Install system deps required by Playwright & Chromium
RUN apt-get update && apt-get install -y \ 
    wget gnupg ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 \ 
    libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 \ 
    libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 libxss1 \ 
    libxtst6 xdg-utils && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && playwright install --with-deps chromium

# Copy project
COPY . .

# Expose the Cloud Run port
ENV PORT=8080

# By default start FastAPI from backend/main.py
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
