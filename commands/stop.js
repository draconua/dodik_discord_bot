const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('').setDMPermission(false),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to stop music!')],
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
        embeds: [createErrorEmbed('There is no active music player!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await queue.stop();
      await client.distube.voices.leave(interaction.guild).catch(() => {});

      return interaction.reply({
        embeds: [createSuccessEmbed('⏹️ Stopped', 'Stopped music playback, cleared queue, and left the voice channel.')],
      });
    } catch (error) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to stop player: ${error.message || error}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};


