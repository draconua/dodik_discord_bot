const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

async function deployCommands() {
  const commands = [];
  const commandsPath = path.join(__dirname, 'commands');

  if (!fs.existsSync(commandsPath)) {
    console.error('❌ Commands directory not found:', commandsPath);
    return false;
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

  if (!config.token || !config.clientId) {
    console.error('❌ Error: DISCORD_TOKEN and CLIENT_ID must be set in your .env file before deploying commands.');
    return false;
  }

  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    let data;
    if (config.guildId) {
      console.log(`Deploying slash commands locally to Guild ID: ${config.guildId}...`);
      data = await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commands }
      );
      console.log(`Successfully registered ${data.length} guild slash commands.`);
    } else {
      console.log('No GUILD_ID specified in .env. Deploying slash commands globally...');
      data = await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commands }
      );
      console.log(`Successfully registered ${data.length} global slash commands.`);
    }
    return true;
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
    return false;
  }
}

// Allow running directly
if (require.main === module) {
  deployCommands().then((success) => process.exit(success ? 0 : 1));
}

module.exports = deployCommands;
