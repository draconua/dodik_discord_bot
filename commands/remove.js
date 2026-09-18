const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('').setDMPermission(false)
    .addIntegerOption(option =>
      option
        .setName('position')
        .setDescription('').setDMPermission(false)
        .setMinValue(2)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to remove songs!')],
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
    if (!queue || !queue.songs || queue.songs.length === 0) {
      return interaction.reply({
        embeds: [createErrorEmbed('The queue is currently empty!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const position = interaction.options.getInteger('position');

    if (position > queue.songs.length) {
      return interaction.reply({
        embeds: [
          createErrorEmbed(`Invalid position! Queue currently has **${queue.songs.length}** tracks (including the current song).`),
        ],
        flags: MessageFlags.Ephemeral,
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
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};


