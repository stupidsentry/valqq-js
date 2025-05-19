if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}



require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ✅ Load all command data
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, folder, file));
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    }
  }
}

// ✅ REST setup
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Refreshing slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, '1373612049011048549'), // Replace with your server ID
      { body: commands }
    );
    console.log('✅ Successfully reloaded guild slash commands.');
  } catch (error) {
    console.error('❌ Error reloading commands:', error);
  }
})();
