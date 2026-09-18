const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('').setDMPermission(false),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to pause music!')],
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

    if (queue.paused) {
      return interaction.reply({
        embeds: [createErrorEmbed('The music is already paused! Use `/resume` to unpause.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      queue.pause();
      return interaction.reply({
        embeds: [createSuccessEmbed('⏸️ Paused', 'Playback has been paused.')],
      });
    } catch (error) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to pause: ${error.message || error}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};


