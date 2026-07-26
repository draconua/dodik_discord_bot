const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const { createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist from YouTube, Spotify, or URL')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('Song title, YouTube URL, or Spotify track/album/playlist link')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to use this command!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
    if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
      return interaction.reply({
        embeds: [createErrorEmbed('I need permissions to join and speak in your voice channel!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const query = interaction.options.getString('query');

    await interaction.deferReply();

    try {
      const playPromise = client.distube.play(voiceChannel, query, {
        textChannel: interaction.channel,
        member: interaction.member,
      });

      const connection = require('@discordjs/voice').getVoiceConnection(interaction.guild.id);
      if (connection) {
        connection.on('stateChange', (oldState, newState) => {
          console.log(`🔊 Voice Connection State: ${oldState.status} ➡️ ${newState.status}`);
        });
        connection.on('error', (err) => {
          console.error('🔊 Voice Connection Internal Error:', err);
        });
      }

      await playPromise;

      await interaction.editReply(`🔍 Searching and processing: **${query}**`);
    } catch (error) {
      console.error('Play command error:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed(`Failed to play song: ${error.message || error}`)],
      });
    }
  },
};
