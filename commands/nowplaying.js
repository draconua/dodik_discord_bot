const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { createErrorEmbed } = require('../utils/embeds');
const { createProgressBar } = require('../utils/progressBar');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('').setDMPermission(false),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);
    if (!queue || !queue.songs || queue.songs.length === 0) {
      return interaction.reply({
        embeds: [createErrorEmbed('There is no song currently playing!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const song = queue.songs[0];
      const currentProgress = queue.currentTime;
      const totalDuration = song.duration;

      const bar = createProgressBar(currentProgress, totalDuration);

      const loopModes = ['Off', 'Track', 'Queue'];
      const loopStatus = loopModes[queue.repeatMode] || 'Off';

      const embed = new EmbedBuilder()
        .setColor(config.bot.embedColor)
        .setTitle('🎶 Now Playing')
        .setDescription(`**[${song.name}](${song.url})**\n\n${bar}`)
        .addFields(
          { name: 'Requested By', value: `${song.user?.toString() || 'Unknown'}`, inline: true },
          { name: 'Volume', value: `${queue.volume}%`, inline: true },
          { name: 'Loop Mode', value: loopStatus, inline: true }
        )
        .setTimestamp();

      if (song.thumbnail) {
        embed.setThumbnail(song.thumbnail);
      }

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Nowplaying command error:', error);
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to get current song info: ${error.message || error}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};


