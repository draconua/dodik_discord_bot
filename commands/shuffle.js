const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the current queue'),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to shuffle the queue!')],
        ephemeral: true,
      });
    }

    const queue = client.distube.getQueue(interaction.guild);
    if (!queue || queue.songs.length <= 1) {
      return interaction.reply({
        embeds: [createErrorEmbed('Not enough songs in the queue to shuffle!')],
        ephemeral: true,
      });
    }

    try {
      await client.distube.shuffle(interaction.guild);
      return interaction.reply({
        embeds: [createSuccessEmbed('🔀 Queue Shuffled', `Shuffled **${queue.songs.length - 1}** upcoming track(s).`)],
      });
    } catch (error) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to shuffle: ${error.message || error}`)],
        ephemeral: true,
      });
    }
  },
};
