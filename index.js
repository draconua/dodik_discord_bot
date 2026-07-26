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

// Initialize Discord Client with required Gateway Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
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
    new YtDlpPlugin(),
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

// Global unhandled promise rejection handler to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const sodium = require('libsodium-wrappers');

// Login to Discord after sodium readiness
if (!config.token) {
  console.error('❌ Error: DISCORD_TOKEN is missing in environment variables or .env file!');
  process.exit(1);
}

(async () => {
  await sodium.ready;
  client.login(config.token);
})();
