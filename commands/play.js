const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const { createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist from YouTube, Spotify, or URL')
    .setDMPermission(false)
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('Song title, YouTube URL, or Spotify track/album/playlist link')
        .setRequired(true)
        .setMaxLength(2000)
    ),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to use this command!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check if bot is already in a different voice channel
    const botVoice = interaction.guild.members.me.voice.channel;
    if (botVoice && botVoice.id !== voiceChannel.id) {
      return interaction.reply({
        embeds: [createErrorEmbed('I am already playing music in another voice channel!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
    if (
      !permissions.has(PermissionsBitField.Flags.ViewChannel) ||
      !permissions.has(PermissionsBitField.Flags.Connect) ||
      !permissions.has(PermissionsBitField.Flags.Speak)
    ) {
      return interaction.reply({
        embeds: [createErrorEmbed('I need View, Connect, and Speak permissions for your voice channel!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const query = interaction.options.getString('query');

    try {
      await interaction.deferReply();
    } catch (error) {
      console.error('Failed to defer reply:', error);
      return; // Cannot continue if we can't reply
    }

    try {
      await client.distube.play(voiceChannel, query, {
        textChannel: interaction.channel,
        member: interaction.member,
      });

      // The 15-minute token expiry might cause this to fail if processing took too long
      await interaction.deleteReply().catch(() => {
        // Fallback: edit reply to show it's done if delete fails due to weird permissions
        interaction.editReply({ content: '✅ Added to queue.' }).catch(() => {});
      });
    } catch (error) {
      console.error('Play command error:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed(`Failed to play: ${error.message || error}`)],
      }).catch(() => {});
    }
  },
};
