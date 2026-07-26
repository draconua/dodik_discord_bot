/**
 * Formats a duration in seconds into MM:SS or HH:MM:SS format.
 * @param {number} seconds
 * @returns {string}
 */
function formatDuration(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const formattedHrs = String(hrs).padStart(2, '0');
    return `${formattedHrs}:${formattedMins}:${formattedSecs}`;
  }
  return `${formattedMins}:${formattedSecs}`;
}

/**
 * Creates a text-based progress bar.
 * @param {number} current - Current position in seconds
 * @param {number} total - Total duration in seconds
 * @param {number} barSize - Length of the progress bar line
 * @param {string} line - Character for unfulfilled progress
 * @param {string} slider - Character for current head position
 * @returns {string}
 */
function createProgressBar(current, total, barSize = 15, line = '▬', slider = '🔘') {
  if (!total || total <= 0) {
    return `${slider}${line.repeat(barSize - 1)} [Live]`;
  }

  const progress = Math.min(Math.max(current / total, 0), 1);
  const sliderPosition = Math.round(progress * barSize);

  const left = line.repeat(Math.max(0, sliderPosition));
  const right = line.repeat(Math.max(0, barSize - sliderPosition));

  const currentTimeStr = formatDuration(current);
  const totalTimeStr = formatDuration(total);

  return `${left}${slider}${right} \`[${currentTimeStr} / ${totalTimeStr}]\``;
}

module.exports = {
  formatDuration,
  createProgressBar,
};
