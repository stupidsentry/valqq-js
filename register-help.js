require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
const CLIENT_ID = process.env.CLIENT_ID;

const helpCommand = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Show information about Valqq Bot features');

(async () => {
  try {
    console.log('🔄 Registering /help...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [helpCommand.toJSON()]
    });
    console.log('✅ /help registered.');
  } catch (err) {
    console.error('❌ Failed to register /help:', err);
  }
})();
