const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current playing song'),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to pause music!')],
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

    if (queue.paused) {
      return interaction.reply({
        embeds: [createErrorEmbed('The music is already paused! Use `/resume` to unpause.')],
        ephemeral: true,
      });
    }

    try {
      client.distube.pause(interaction.guild);
      return interaction.reply({
        embeds: [createSuccessEmbed('⏸️ Paused', 'Playback has been paused.')],
      });
    } catch (error) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to pause: ${error.message || error}`)],
        ephemeral: true,
      });
    }
  },
};
