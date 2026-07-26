const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a specific track from the queue')
    .addIntegerOption(option =>
      option
        .setName('position')
        .setDescription('Track position in queue (1 = currently playing, 2 = next song, etc.)')
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to remove songs!')],
        ephemeral: true,
      });
    }

    const queue = client.distube.getQueue(interaction.guild);
    if (!queue || !queue.songs || queue.songs.length === 0) {
      return interaction.reply({
        embeds: [createErrorEmbed('The queue is currently empty!')],
        ephemeral: true,
      });
    }

    const position = interaction.options.getInteger('position');

    if (position === 1) {
      return interaction.reply({
        embeds: [
          createErrorEmbed('Position 1 is the currently playing song! Use `/skip` if you want to skip it.'),
        ],
        ephemeral: true,
      });
    }

    if (position > queue.songs.length) {
      return interaction.reply({
        embeds: [
          createErrorEmbed(`Invalid position! Queue currently has **${queue.songs.length}** songs.`),
        ],
        ephemeral: true,
      });
    }

    try {
      const removedSong = queue.songs.splice(position - 1, 1)[0];
      return interaction.reply({
        embeds: [
          createSuccessEmbed(
            '🗑️ Removed Track',
            `Removed **[${removedSong.name}](${removedSong.url})** from position #${position}.`
          ),
        ],
      });
    } catch (error) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to remove track: ${error.message || error}`)],
        ephemeral: true,
      });
    }
  },
};
