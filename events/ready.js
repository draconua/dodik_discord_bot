const { ActivityType, Events } = require('discord.js');
const { generateDependencyReport } = require('@discordjs/voice');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`=================================`);
    console.log(`🤖 Logged in as ${client.user.tag}`);
    console.log(`🌐 Ready on ${client.guilds.cache.size} server(s)`);
    console.log(`=================================`);
    console.log(generateDependencyReport());

    client.user.setActivity('/play | Music Bot', { type: ActivityType.Listening });
  },
};
