const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createErrorEmbed } = require('../utils/embeds');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Display the current music queue')
    .addIntegerOption(option =>
      option
        .setName('page')
        .setDescription('Page number to view (default 1)')
        .setMinValue(1)
    ),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild);
    if (!queue || !queue.songs || queue.songs.length === 0) {
      return interaction.reply({
        embeds: [createErrorEmbed('The queue is currently empty!')],
        ephemeral: true,
      });
    }

    const currentSong = queue.songs[0];
    const upcomingSongs = queue.songs.slice(1);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(upcomingSongs.length / itemsPerPage) || 1;
    const page = Math.min(interaction.options.getInteger('page') || 1, totalPages);

    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageSongs = upcomingSongs.slice(startIdx, endIdx);

    let queueString = `**Now Playing:**\n🎶 [${currentSong.name}](${currentSong.url}) - \`${currentSong.formattedDuration}\` | Req: ${currentSong.user}\n\n`;

    if (pageSongs.length > 0) {
      queueString += '**Up Next:**\n';
      queueString += pageSongs
        .map(
          (song, index) =>
            `\`${startIdx + index + 1}.\` [${song.name}](${song.url}) - \`${song.formattedDuration}\` | Req: ${song.user}`
        )
        .join('\n');
    } else if (upcomingSongs.length === 0) {
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
  },
};
