const {
  createPlaySongEmbed,
  createAddSongEmbed,
  createAddListEmbed,
  createErrorEmbed,
  createSuccessEmbed,
} = require('../utils/embeds');
const config = require('../config');

// Store active disconnect timers per guild
const idleTimers = new Map();

function clearIdleTimer(guildId) {
  if (idleTimers.has(guildId)) {
    clearTimeout(idleTimers.get(guildId));
    idleTimers.delete(guildId);
  }
}

function startIdleTimer(distube, guildId, reasonMessage, textChannel) {
  clearIdleTimer(guildId);
  const timeoutMs = (config.bot.idleTimeoutMinutes || 5) * 60 * 1000;

  const timer = setTimeout(() => {
    const queue = distube.getQueue(guildId);
    if (!queue || !queue.playing) {
      distube.voices.leave(guildId).catch(() => {});
      if (textChannel) {
        textChannel
          .send({
            embeds: [createSuccessEmbed('👋 Auto Disconnected', reasonMessage)],
          })
          .catch(() => {});
      }
    }
    idleTimers.delete(guildId);
  }, timeoutMs);

  idleTimers.set(guildId, timer);
}

module.exports = (distube) => {
  distube.on('playSong', (queue, song) => {
    clearIdleTimer(queue.guildId);
    if (queue.textChannel) {
      queue.textChannel
        .send({ embeds: [createPlaySongEmbed(song)] })
        .catch(err => console.error('Error sending playSong embed:', err));
    }
  });

  distube.on('addSong', (queue, song) => {
    clearIdleTimer(queue.guildId);
    if (queue.songs.length > 1 && queue.textChannel) {
      queue.textChannel
        .send({ embeds: [createAddSongEmbed(song, queue)] })
        .catch(err => console.error('Error sending addSong embed:', err));
    }
  });

  distube.on('addList', (queue, playlist) => {
    clearIdleTimer(queue.guildId);
    if (queue.textChannel) {
      queue.textChannel
        .send({ embeds: [createAddListEmbed(playlist, queue)] })
        .catch(err => console.error('Error sending addList embed:', err));
    }
  });

  distube.on('empty', (queue) => {
    startIdleTimer(
      distube,
      queue.guildId,
      'Disconnected after 5 minutes of inactivity in an empty voice channel.',
      queue.textChannel
    );
  });

  distube.on('finish', (queue) => {
    if (queue.textChannel) {
      queue.textChannel
        .send({
          embeds: [
            createSuccessEmbed(
              '🏁 Queue Finished',
              'Finished playing all tracks in queue.'
            ),
          ],
        })
        .catch(err => console.error('Error sending finish embed:', err));
    }

    startIdleTimer(
      distube,
      queue.guildId,
      'Disconnected after 5 minutes of inactivity.',
      queue.textChannel
    );
  });

  distube.on('error', (channel, error) => {
    console.error('DisTube Player Error:', error);
    const errorMessage = error?.message || 'An unknown audio extraction error occurred.';

    if (channel && typeof channel.send === 'function') {
      channel
        .send({
          embeds: [
            createErrorEmbed(
              `An error occurred while playing music: **${errorMessage}**`
            ),
          ],
        })
        .catch(err => console.error('Error sending distube error embed:', err));
    }
  });
};
