const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../../data/welcomeSettings.json');
if (!fs.existsSync(SETTINGS_FILE)) fs.writeFileSync(SETTINGS_FILE, '{}');

function loadSettings() {
  return JSON.parse(fs.readFileSync(SETTINGS_FILE));
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetwelcome')
    .setDescription('Remove the saved welcome message settings.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

  async execute(interaction) {
    const settings = loadSettings();
    const guildId = interaction.guildId;

    if (settings[guildId]) {
      delete settings[guildId].welcomeChannelId;
      delete settings[guildId].title;
      delete settings[guildId].message;
      delete settings[guildId].color;
    }

    saveSettings(settings);

    await interaction.reply({
      content: '✅ Welcome message configuration has been reset.',
      ephemeral: true
    });
  }
};
