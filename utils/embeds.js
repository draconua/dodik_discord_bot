const { EmbedBuilder } = require('discord.js');
const config = require('../config');

/**
 * Generates standard success/info embed
 */
function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(config.bot.successColor)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Generates standard error embed
 */
function createErrorEmbed(description) {
  return new EmbedBuilder()
    .setColor(config.bot.errorColor)
    .setTitle('❌ Error')
    .setDescription(description)
    .setTimestamp();
}

/**
 * Generates Embed for currently starting / playing track
 */
function createPlaySongEmbed(song) {
  const embed = new EmbedBuilder()
    .setColor(config.bot.embedColor)
    .setTitle('🎶 Now Playing')
    .setDescription(`**[${song.name}](${song.url})**`)
    .addFields(
      { name: 'Duration', value: song.formattedDuration || 'Unknown', inline: true },
      { name: 'Requested By', value: `${song.user}`, inline: true },
      { name: 'Uploader', value: song.uploader?.name || 'Unknown', inline: true }
    )
    .setTimestamp();

  if (song.thumbnail) {
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
    .setDescription(`**[${song.name}](${song.url})**`)
    .addFields(
      { name: 'Duration', value: song.formattedDuration || 'Unknown', inline: true },
      { name: 'Position in Queue', value: `#${queue.songs.length}`, inline: true },
      { name: 'Requested By', value: `${song.user}`, inline: true }
    )
    .setTimestamp();

  if (song.thumbnail) {
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
    .setDescription(`**[${playlist.name}](${playlist.url})**`)
    .addFields(
      { name: 'Songs Count', value: `${playlist.songs.length}`, inline: true },
      { name: 'Requested By', value: `${playlist.user}`, inline: true }
    )
    .setTimestamp();

  if (playlist.thumbnail) {
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
