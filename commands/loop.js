const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { RepeatMode } = require('distube');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('').setDMPermission(false)
    .addStringOption(option =>
      option
        .setName('mode')
        .setDescription('').setDMPermission(false)
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

    const modeChoice = interaction.options.getString('mode');
    let modeValue;
    let modeText;

    switch (modeChoice) {
      case 'track':
        modeValue = RepeatMode.SONG;
        modeText = 'Current Track 🔂';
        break;
      case 'queue':
        modeValue = RepeatMode.QUEUE;
        modeText = 'Entire Queue 🔁';
        break;
      default:
        modeValue = RepeatMode.DISABLED;
        modeText = 'Off ➡️';
        break;
    }

    try {
      queue.setRepeatMode(modeValue);
      return interaction.reply({
        embeds: [createSuccessEmbed('🔄 Loop Mode Set', `Loop mode is now set to: **${modeText}**`)],
      });
    } catch (error) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to set loop mode: ${error.message || error}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};


