const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const settingsManager = require('../../utils/settingsManager.js');

const ALLOWED_USER_ID = '692312001338277918'; // 👈 your user ID here

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testconfig')
    .setDescription('Test config API and auto-create a default config if needed.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

  async execute(interaction) {
    // ✅ Restrict to specific user
    if (interaction.user.id !== ALLOWED_USER_ID) {
      return interaction.reply({
        content: '❌ You are not authorised to use this command.',
        ephemeral: true
      });
    }

    const guildId = interaction.guildId;

    // 🔁 Load or create config
    let config = await settingsManager.load(guildId);
    if (!config) {
      config = {
        welcomeChannelId: null,
        leaveChannelId: null,
        title: '👋 Welcome!',
        message: 'Welcome to the server, {user}!',
        color: '#5865F2',
        leaveTitle: '👋 Goodbye!',
        leaveMessage: '{user} has left the server.',
        leaveColor: '#e67e22'
      };

      const success = await settingsManager.save(guildId, config);

      if (!success) {
        return interaction.reply({
          content: '❌ Failed to save default config to API.',
          ephemeral: true
        });
      }
    }

    // ✅ Send config preview
    await interaction.reply({
      content: `✅ Config for **${interaction.guild.name}** is available.\n\n\`\`\`json\n${JSON.stringify(config, null, 2)}\n\`\`\``,
      ephemeral: true
    });
  }
};
