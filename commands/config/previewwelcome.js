const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../../data/welcomeSettings.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('previewwelcome')
    .setDescription('Preview the current welcome embed for your server.'),

  async execute(interaction) {
    const settings = fs.existsSync(SETTINGS_FILE)
      ? JSON.parse(fs.readFileSync(SETTINGS_FILE))
      : {};
    const config = settings[interaction.guildId];

    if (!config) {
      return interaction.reply({
        content: '❌ No welcome configuration found. Please run `/configwelcome` first.',
        ephemeral: true
      });
    }

    const previewEmbed = new EmbedBuilder()
      .setColor(config.color || 'Blurple')
      .setTitle(config.title || '👋 Welcome!')
      .setDescription(config.message.replace('{user}', `<@${interaction.user.id}>`))
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({
      content: `🔍 Preview of your welcome message (to be sent in <#${config.channelId}>):`,
      embeds: [previewEmbed],
      ephemeral: true
    });
  }
};
