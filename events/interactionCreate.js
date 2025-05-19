module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`❌ Error in command "/${interaction.commandName}":`, error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
      }
    }
  }
};
