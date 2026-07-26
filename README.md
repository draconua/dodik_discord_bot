# 🎵 Discord Music Bot (discord.js v14 + DisTube)

A modern, high-performance, feature-packed Discord Music Bot built with **Node.js**, **discord.js v14**, and **DisTube** with full **Spotify** link resolution and YouTube playback.

---

## ✨ Features

- 🎧 **YouTube & Spotify Support**: Plays YouTube URLs, YouTube search queries, Spotify track links, Spotify album links, and Spotify playlist links directly.
- ⚡ **Slash Commands**: Registered via Discord REST API (`/play`, `/skip`, `/pause`, `/resume`, `/queue`, `/nowplaying`, `/volume`, `/loop`, `/shuffle`, `/stop`, `/remove`).
- 📊 **Visual Progress Bar**: Real-time progress bar for `/nowplaying`.
- 🔁 **Pagination**: Built-in queue pagination for large queues.
- ⏱️ **Auto-Disconnect**: Disconnects automatically after 5 minutes of inactivity (empty voice channel or no playback).
- 🐳 **Docker Ready**: Production-ready container setup with FFmpeg for deployment on Railway, Fly.io, or VPS.

---

## 🛠️ Step-by-Step Discord Bot Setup

### 1. Create a Discord Bot Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** (top right), enter a name (e.g. `MyMusicBot`), and click **Create**.
3. In the left sidebar, navigate to **Bot**:
   - Click **Reset Token** (or Copy Token) and save your bot token. You will set this as `DISCORD_TOKEN`.
   - Scroll down to **Privileged Gateway Intents** and enable:
     - **Server Members Intent** (Optional)
     - **Message Content Intent** (Optional)
4. In the left sidebar, navigate to **OAuth2 -> General**:
   - Copy the **CLIENT ID** (Application ID). You will set this as `CLIENT_ID`.

---

### 2. Invite the Bot to Your Server

To generate your bot invite link:

1. Go to **OAuth2 -> URL Generator** in the Developer Portal.
2. Under **Scopes**, select:
   - `bot`
   - `applications.commands`
3. Under **Bot Permissions**, select:
   - **Connect** (Voice)
   - **Speak** (Voice)
   - **Send Messages** (Text)
   - **Embed Links** (Text)
   - **Read Message History** (Text)
4. Copy the generated URL and paste it into your browser to invite the bot to your Discord server.

*(Or use this template URL replacing `YOUR_CLIENT_ID`:)*
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=36700160&scope=bot%20applications.commands
```

---

## ⚙️ Environment Variables Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```env
# Required Discord Application Credentials
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# Optional: Server Guild ID (speeds up slash command registration for instant testing in a specific server)
GUILD_ID=your_development_guild_id_here

# Optional: Spotify API Credentials (increases rate limits for resolving large Spotify playlists)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

> **Note on Spotify**: Basic Spotify link resolution works out-of-the-box using public Spotify metadata without needing API keys. Adding `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` is only required if you hit rate limits with large playlists.

---

## 🚀 Local Development & Execution

### Prerequisites
- **Node.js** v18.0.0 or higher
- **FFmpeg** installed on your system (or supplied via `ffmpeg-static` package)

### Installation & Execution

1. Install dependencies:
   ```bash
   npm install
   ```

2. Deploy slash commands to Discord:
   ```bash
   npm run deploy
   ```

3. Start the bot:
   ```bash
   npm start
   ```

---

## 📜 Commands List

| Command | Usage | Description |
| :--- | :--- | :--- |
| `/play` | `/play <query or url>` | Play YouTube title/link, Spotify song/album/playlist |
| `/skip` | `/skip` | Skip the current playing track |
| `/pause` | `/pause` | Pause music playback |
| `/resume` | `/resume` | Resume paused music |
| `/queue` | `/queue [page]` | Display current queue with pagination |
| `/nowplaying` | `/nowplaying` | Show currently playing song with visual progress bar |
| `/volume` | `/volume <0-100>` | Set audio playback volume |
| `/loop` | `/loop <off\|track\|queue>` | Toggle loop mode |
| `/shuffle` | `/shuffle` | Shuffle upcoming queue |
| `/stop` | `/stop` | Stop music, clear queue, and leave voice channel |
| `/remove` | `/remove <position>` | Remove a specific track from queue |

---

## 🐳 Docker & Cloud Deployment

### Running with Docker Locally

1. Build the Docker image:
   ```bash
   docker build -t discord-music-bot .
   ```

2. Run the container:
   ```bash
   docker run -d --name music-bot --env-file .env discord-music-bot
   ```

### Deployment to Cloud Hosts

#### Railway
1. Fork or push this repository to GitHub.
2. Connect your GitHub repository to [Railway.app](https://railway.app/).
3. Add your Environment Variables (`DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`) in Railway's dashboard under **Variables**.
4. Railway automatically detects the `Dockerfile` and builds/deploys your bot.

#### Fly.io
1. Install `flyctl` and log in.
2. Run `fly launch` in the repository folder.
3. Set secrets: `fly secrets set DISCORD_TOKEN=xxx CLIENT_ID=xxx`.
4. Deploy using `fly deploy`.

---

## 📁 Project Structure

```
discord-music-bot/
├── commands/               # Slash command definitions
│   ├── play.js
│   ├── skip.js
│   ├── pause.js
│   ├── resume.js
│   ├── queue.js
│   ├── nowplaying.js
│   ├── volume.js
│   ├── loop.js
│   ├── shuffle.js
│   ├── stop.js
│   └── remove.js
├── events/                 # Event handlers
│   ├── ready.js
│   ├── interactionCreate.js
│   └── distubeEvents.js    # Player events (playSong, error, etc.)
├── utils/                  # Helper utilities
│   ├── embeds.js           # Rich Discord embeds
│   └── progressBar.js      # Text progress bar generator
├── config.js               # Centralized configuration
├── deploy-commands.js      # Discord REST API command registration
├── index.js                # Main application entry point
├── Dockerfile              # Container definition
├── .env.example            # Environment template
└── package.json            # Node.js dependencies & scripts
```
