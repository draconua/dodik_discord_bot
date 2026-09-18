const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('').setDMPermission(false)
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('').setDMPermission(false)
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to change volume!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const botVoice = interaction.guild.members.me.voice.channel;
    if (botVoice && botVoice.id !== voiceChannel.id) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in the same voice channel as the bot!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const queue = client.distube.getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply({
        embeds: [createErrorEmbed('There is no queue or song playing!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const volume = interaction.options.getInteger('amount');

    try {
      queue.setVolume(volume);
      return interaction.reply({
        embeds: [createSuccessEmbed('🔊 Volume Changed', `Set audio volume to **${volume}%**`)],
      });
    } catch (error) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to set volume: ${error.message || error}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};


