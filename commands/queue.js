const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { createErrorEmbed } = require('../utils/embeds');
const config = require('../config');

// Helper to escape markdown brackets in titles
function escapeMarkdown(text) {
  if (!text) return 'Unknown';
  return text.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Display the current music queue')
    .setDMPermission(false)
    .addIntegerOption(option =>
      option
        .setName('page')
        .setDescription('Page number to view (default 1)')
        .setMinValue(1)
    ),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild);
    if (!queue || !queue.songs || queue.songs.length === 0) {
      return interaction.reply({
        embeds: [createErrorEmbed('The queue is currently empty!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const currentSong = queue.songs[0];
      const itemsPerPage = 10;
      const upcomingCount = queue.songs.length - 1;
      const totalPages = Math.ceil(upcomingCount / itemsPerPage) || 1;
      const page = Math.min(interaction.options.getInteger('page') || 1, totalPages);

      const startIdx = (page - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      // Fetch directly without duplicating the array
      const pageSongs = queue.songs.slice(startIdx + 1, endIdx + 1);

      const currentName = escapeMarkdown(currentSong.name);
      let queueString = `**Now Playing:**\n🎶 [${currentName}](${currentSong.url}) - \`${currentSong.formattedDuration}\` | Req: ${currentSong.user?.toString() || 'Unknown'}\n\n`;

      if (pageSongs.length > 0) {
        queueString += '**Up Next:**\n';
        for (let i = 0; i < pageSongs.length; i++) {
          const song = pageSongs[i];
          const songName = escapeMarkdown(song.name);
          const trackString = `\`${startIdx + i + 1}.\` [${songName}](${song.url}) - \`${song.formattedDuration}\` | Req: ${song.user?.toString() || 'Unknown'}\n`;
          
          // Stop adding tracks if it exceeds the Discord 4096 char limit
          if (queueString.length + trackString.length > 4000) {
            queueString += `*...and ${pageSongs.length - i} more tracks on this page.*`;
            break;
          }
          queueString += trackString;
        }
      } else if (upcomingCount === 0) {
        queueString += '*No more songs in queue.*';
      }

      const embed = new EmbedBuilder()
        .setColor(config.bot.embedColor)
        .setTitle(`🎵 Server Queue (${queue.songs.length} track${queue.songs.length === 1 ? '' : 's'})`)
        .setDescription(queueString)
        .setFooter({
          text: `Page ${page} of ${totalPages} • Total Duration: ${queue.formattedDuration}`,
        })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Queue command error:', error);
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to display queue: ${error.message || error}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
