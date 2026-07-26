const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playing, clear the queue, and leave the voice channel'),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to stop music!')],
        ephemeral: true,
      });
    }

    const queue = client.distube.getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply({
        embeds: [createErrorEmbed('There is no active music player!')],
        ephemeral: true,
      });
    }

    try {
      await client.distube.stop(interaction.guild);
      await client.distube.voices.leave(interaction.guild);

      return interaction.reply({
        embeds: [createSuccessEmbed('⏹️ Stopped', 'Stopped music playback, cleared queue, and left the voice channel.')],
      });
    } catch (error) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to stop player: ${error.message || error}`)],
        ephemeral: true,
      });
    }
  },
};
