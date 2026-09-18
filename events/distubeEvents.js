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
  const timeoutMinutes = config.bot.idleTimeoutMinutes || 5;
  const timeoutMs = timeoutMinutes * 60 * 1000;

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
    clearIdleTimer(queue.id);
    if (queue.textChannel) {
      queue.textChannel
        .send({ embeds: [createPlaySongEmbed(song)] })
        .catch(err => {
          console.error('Error sending playSong embed:', err);
          if (err.code === 10003) queue.textChannel = null; // Unknown Channel
        });
    }
  });

  distube.on('addSong', (queue, song) => {
    clearIdleTimer(queue.id);
    if (queue.songs.length > 1 && queue.textChannel) {
      queue.textChannel
        .send({ embeds: [createAddSongEmbed(song, queue)] })
        .catch(err => {
          console.error('Error sending addSong embed:', err);
          if (err.code === 10003) queue.textChannel = null;
        });
    }
  });

  distube.on('addList', (queue, playlist) => {
    clearIdleTimer(queue.id);
    if (queue.textChannel) {
      queue.textChannel
        .send({ embeds: [createAddListEmbed(playlist, queue)] })
        .catch(err => {
          console.error('Error sending addList embed:', err);
          if (err.code === 10003) queue.textChannel = null;
        });
    }
  });

  distube.on('empty', (queue) => {
    const timeoutMinutes = config.bot.idleTimeoutMinutes || 5;
    startIdleTimer(
      distube,
      queue.id,
      `Disconnected after ${timeoutMinutes} minutes of inactivity in an empty voice channel.`,
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
        .catch(err => {
          console.error('Error sending finish embed:', err);
          if (err.code === 10003) queue.textChannel = null;
        });
    }

    const timeoutMinutes = config.bot.idleTimeoutMinutes || 5;
    startIdleTimer(
      distube,
      queue.id,
      `Disconnected after ${timeoutMinutes} minutes of inactivity.`,
      queue.textChannel
    );
  });
  
  distube.on('disconnect', (queue) => {
    // If the bot leaves the channel (manually or kicked), clear any running idle timers.
    clearIdleTimer(queue.id);
  });

  // DisTube v5 error event signature: (error, queue, song)
  distube.on('error', (error, queue) => {
    console.error('DisTube Player Error:', error);
    const errorMessage = error?.message || 'An unknown audio extraction error occurred.';

    // Queue might be a TextChannel if error happens before queue init in older versions,
    // but in v5 it's typed properly. We fallback to queue itself if it has a send method.
    const textChannel = queue?.textChannel || (typeof queue?.send === 'function' ? queue : null);
    
    if (textChannel && typeof textChannel.send === 'function') {
      textChannel
        .send({
          embeds: [
            createErrorEmbed(
              `An error occurred while playing music: **${errorMessage}**`
            ),
          ],
        })
        .catch(err => {
          console.error('Error sending distube error embed:', err);
          if (err.code === 10003 && queue && typeof queue === 'object' && 'textChannel' in queue) {
             queue.textChannel = null;
          }
        });
    }
  });
};
