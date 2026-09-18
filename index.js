const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Initialize Discord Client with only strictly required Gateway Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

// Configure DisTube Spotify plugin
const spotifyPluginOptions = {};
if (config.spotify.clientId && config.spotify.clientSecret) {
  spotifyPluginOptions.api = {
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
  };
}

const ffmpegPath = require('ffmpeg-static');
if (ffmpegPath) {
  process.env.FFMPEG_PATH = ffmpegPath;
}

// Initialize DisTube Player Engine
const distube = new DisTube(client, {
  ffmpeg: {
    path: ffmpegPath,
  },
  emitNewSongOnly: true,
  plugins: [
    new SpotifyPlugin(spotifyPluginOptions),
    new YtDlpPlugin({ update: false }),
  ],
});

client.distube = distube;

// Register DisTube Player Event Handlers
require('./events/distubeEvents')(client.distube);

// Load Slash Commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`[WARNING] Command at ${filePath} missing "data" or "execute".`);
    }
  }
}

// Load Discord Client Events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') && file !== 'distubeEvents.js');
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

// Global unhandled promise rejection handler to prevent crashes and leaks
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Optional: exit process on unhandled rejections if stability is paramount
  // process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // After an uncaught exception, Node.js is in an undefined state.
  // Log and exit to avoid silent corruption.
  process.exit(1);
});

// Login to Discord
if (!config.token) {
  console.error('❌ Error: DISCORD_TOKEN is missing in environment variables or .env file!');
  process.exit(1);
}

client.login(config.token).catch((error) => {
  console.error('❌ Failed to login to Discord:', error);
  process.exit(1);
});
