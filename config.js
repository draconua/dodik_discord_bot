require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
  },
  bot: {
    embedColor: '#5865F2',
    errorColor: '#ED4245',
    successColor: '#57F287',
    idleTimeoutMinutes: 5,
  },
};
