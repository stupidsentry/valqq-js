require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  const commands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));

  console.log(`🔎 Found ${commands.length} commands.`);
  for (const cmd of commands) {
    console.log(`🗑 Deleting ${cmd.name}`);
    await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, cmd.id));
  }

  console.log('✅ All global commands deleted. Restart your bot to re-register cleanly.');
})();
