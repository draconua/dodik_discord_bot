# Use official Node.js 20 LTS Slim (Debian-based) image
FROM node:20-slim

# Install FFmpeg, Python, build tools, and git required for audio processing and yt-dlp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    git \
 && rm -rf /var/lib/apt/lists/*

# Create application working directory
WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install application dependencies
RUN npm ci --only=production || npm install --production

# Copy application source code
COPY . .

# Environment defaults
ENV NODE_ENV=production

# Start the Discord Music Bot
CMD ["npm", "start"]
