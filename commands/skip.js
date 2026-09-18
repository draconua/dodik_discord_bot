const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('').setDMPermission(false),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [createErrorEmbed('You must be in a voice channel to skip songs!')],
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
        embeds: [createErrorEmbed('There is no song currently playing!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const skippedName = queue.songs[0]?.name || 'Unknown';

      if (queue.songs.length <= 1 && !queue.autoplay) {
        await queue.stop();
        return interaction.reply({
          embeds: [createSuccessEmbed('⏭️ Skipped', `Skipped **${skippedName}** (last song in queue).`)],
        });
      } else {
        await queue.skip();
        return interaction.reply({
          embeds: [createSuccessEmbed('⏭️ Skipped', `Skipped **${skippedName}**.`)],
        });
      }
    } catch (error) {
      console.error('Skip command error:', error);
      return interaction.reply({
        embeds: [createErrorEmbed(`Failed to skip: ${error.message || error}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};


