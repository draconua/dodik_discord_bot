const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'node_modules', '@distube', 'yt-dlp', 'dist', 'index.js');

if (!fs.existsSync(targetPath)) {
  console.log('⚠️  @distube/yt-dlp dist file not found, skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(targetPath, 'utf8');

// The target string to find: stderr output being concatenated into the JSON output buffer
const target = 'process2.stderr?.on("data", (chunk) => {\n      output += chunk;\n    });';
const replacement = 'process2.stderr?.on("data", (chunk) => {\n      // output += chunk; // DISABLED TO PREVENT JSON.parse ERRORS\n    });';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('✅ Successfully patched @distube/yt-dlp to prevent JSON parse errors.');
} else if (content.includes('// output += chunk;') || content.includes('// stderr excluded')) {
  console.log('ℹ️  @distube/yt-dlp is already patched, no changes needed.');
} else {
  console.warn('⚠️  Could not find the expected code in @distube/yt-dlp. The file format may have changed. Patch skipped.');
}
