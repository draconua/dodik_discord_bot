# Use official Node.js 20 LTS Alpine image
FROM node:20-alpine

# Install FFmpeg, Python, and build dependencies required for audio processing and yt-dlp
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++ \
    git

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
