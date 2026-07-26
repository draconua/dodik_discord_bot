const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set the loop repeat mode')
    .addStringOption(option =>
      option
        .setName('mode')
        .setDescription('Loop mode to set')
        .setRequired(true)
        .addChoices(
          { name: 'Off', value: 'off' },
          { name: 'Track', value: 'track' },
          { name: 'Queue', value: 'queue' }
        )
    ),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to set loop mode!')],
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

    const modeChoice = interaction.options.getString('mode');
    let modeValue = 0;
    let modeText = 'Off';

    if (modeChoice === 'track') {
      modeValue = 1;
      modeText = 'Current Track 🔂';
    } else if (modeChoice === 'queue') {
      modeValue = 2;
      modeText = 'Entire Queue 🔁';
    } else {
      modeValue = 0;
      modeText = 'Off ➡️';
    }

    try {
      client.distube.setRepeatMode(interaction.guild, modeValue);
      return interaction.reply({
        embeds: [createSuccessEmbed('🔄 Loop Mode Set', `Loop mode is now set to: **${modeText}**`)],
      });
    } catch (error) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to set loop mode: ${error.message || error}`)],
        ephemeral: true,
      });
    }
  },
};
