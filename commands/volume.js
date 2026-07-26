const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set the playback volume (0 - 100)')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Volume level from 0 to 100')
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to change volume!')],
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

    const volume = interaction.options.getInteger('amount');

    try {
      client.distube.setVolume(interaction.guild, volume);
      return interaction.reply({
        embeds: [createSuccessEmbed('🔊 Volume Changed', `Set audio volume to **${volume}%**`)],
      });
    } catch (error) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to set volume: ${error.message || error}`)],
        ephemeral: true,
      });
    }
  },
};
