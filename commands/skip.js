const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current playing song'),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to skip songs!')],
        ephemeral: true,
      });
    }

    const queue = client.distube.getQueue(interaction.guild);
    if (!queue || !queue.playing) {
      return interaction.reply({
        embeds: [createErrorEmbed('There is no song currently playing!')],
        ephemeral: true,
      });
    }

    try {
      if (queue.songs.length === 1 && !queue.autoplay) {
        await client.distube.stop(interaction.guild);
        return interaction.reply({
          embeds: [createSuccessEmbed('⏭️ Skipped', 'Skipped the last song in queue.')],
        });
      } else {
        const skippedSong = await client.distube.skip(interaction.guild);
        return interaction.reply({
          embeds: [createSuccessEmbed('⏭️ Skipped', `Skipped **${skippedSong.name}**`)].filter(Boolean),
        });
      }
    } catch (error) {
      console.error('Skip command error:', error);
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to skip: ${error.message || error}`)],
        ephemeral: true,
      });
    }
  },
};
