const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to resume music!')],
        ephemeral: true,
      });
    }

    const queue = client.distube.getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply({
        embeds: [createErrorEmbed('There is no queue or song playing!')],
        ephemeral: true,
      });
    }

    if (!queue.paused) {
      return interaction.reply({
        embeds: [createErrorEmbed('The music is not paused!')],
        ephemeral: true,
      });
    }

    try {
      client.distube.resume(interaction.guild);
      return interaction.reply({
        embeds: [createSuccessEmbed('▶️ Resumed', 'Playback has been resumed.')],
      });
    } catch (error) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to resume: ${error.message || error}`)],
        ephemeral: true,
      });
    }
  },
};
