const { EmbedBuilder } = require('discord.js');
const config = require('../config');

// Helper to escape markdown brackets
function escape(text) {
  if (!text) return 'Unknown';
  return text.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

// Helper to truncate text to a maximum length safely
function truncate(text, maxLength) {
  if (!text) return 'Unknown';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Helper to check if string is a valid HTTP URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Generates standard success/info embed
 */
function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(config.bot.successColor)
    .setTitle(truncate(title || 'Success', 256))
    .setDescription(truncate(description || 'Operation completed successfully.', 4096))
    .setTimestamp();
}

/**
 * Generates standard error embed
 */
function createErrorEmbed(description) {
  return new EmbedBuilder()
    .setColor(config.bot.errorColor)
    .setTitle('❌ Error')
    .setDescription(truncate(description || 'An unknown error occurred.', 4096))
    .setTimestamp();
}

/**
 * Generates Embed for currently starting / playing track
 */
function createPlaySongEmbed(song) {
  const embed = new EmbedBuilder()
    .setColor(config.bot.embedColor)
    .setTitle('🎶 Now Playing')
    .setDescription(`**[${escape(song.name)}](${song.url})**`)
    .addFields(
      { name: 'Duration', value: song.formattedDuration || 'Unknown', inline: true },
      { name: 'Requested By', value: song.user?.toString() || 'Unknown', inline: true },
      { name: 'Uploader', value: truncate(song.uploader?.name, 1024), inline: true }
    )
    .setTimestamp();

  if (song.thumbnail && isValidUrl(song.thumbnail)) {
    embed.setThumbnail(song.thumbnail);
  }

  return embed;
}

/**
 * Generates Embed for added song/playlist to queue
 */
function createAddSongEmbed(song, queue) {
  const embed = new EmbedBuilder()
    .setColor(config.bot.embedColor)
    .setTitle('✅ Added to Queue')
    .setDescription(`**[${escape(song.name)}](${song.url})**`)
    .addFields(
      { name: 'Duration', value: song.formattedDuration || 'Unknown', inline: true },
      { name: 'Position in Queue', value: `#${queue.songs.length}`, inline: true },
      { name: 'Requested By', value: song.user?.toString() || 'Unknown', inline: true }
    )
    .setTimestamp();

  if (song.thumbnail && isValidUrl(song.thumbnail)) {
    embed.setThumbnail(song.thumbnail);
  }

  return embed;
}

/**
 * Generates Embed for added playlist
 */
function createAddListEmbed(playlist, queue) {
  const embed = new EmbedBuilder()
    .setColor(config.bot.embedColor)
    .setTitle('✅ Added Playlist to Queue')
    .setDescription(`**[${escape(playlist.name)}](${playlist.url})**`)
    .addFields(
      { name: 'Songs Count', value: `${playlist.songs.length}`, inline: true },
      { name: 'Requested By', value: playlist.user?.toString() || 'Unknown', inline: true }
    )
    .setTimestamp();

  if (playlist.thumbnail && isValidUrl(playlist.thumbnail)) {
    embed.setThumbnail(playlist.thumbnail);
  }

  return embed;
}

module.exports = {
  createSuccessEmbed,
  createErrorEmbed,
  createPlaySongEmbed,
  createAddSongEmbed,
  createAddListEmbed,
};
