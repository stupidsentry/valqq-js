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
    .setName('resetleave')
    .setDescription('Remove the saved leave message settings.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

  async execute(interaction) {
    const settings = loadSettings();
    const guildId = interaction.guildId;

    if (settings[guildId]) {
      delete settings[guildId].leaveChannelId;
      delete settings[guildId].leaveTitle;
      delete settings[guildId].leaveMessage;
      delete settings[guildId].leaveColor;
    }

    saveSettings(settings);

    await interaction.reply({
      content: '✅ Leave message configuration has been reset.',
      ephemeral: true
    });
  }
};
