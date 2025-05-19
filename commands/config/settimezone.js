const { SlashCommandBuilder } = require('discord.js');
const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../../data/timezoneSettings.json');
if (!fs.existsSync(SETTINGS_FILE)) fs.writeFileSync(SETTINGS_FILE, '{}');

function loadTimezones() {
  return JSON.parse(fs.readFileSync(SETTINGS_FILE));
}

function saveTimezones(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settimezone')
    .setDescription('Set your server\'s default timezone')
    .addStringOption(opt =>
      opt.setName('timezone')
        .setDescription('Timezone (e.g. Australia/Sydney, UTC, America/New_York)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const tz = interaction.options.getString('timezone');

    if (!DateTime.now().setZone(tz).isValid) {
      return interaction.reply({ content: `❌ Invalid timezone: \`${tz}\`. Use a valid IANA timezone like \`Australia/Sydney\`.`, ephemeral: true });
    }

    const settings = loadTimezones();
    settings[interaction.guildId] = tz;
    saveTimezones(settings);

    await interaction.reply({
      content: `✅ Timezone set to \`${tz}\` for this server.`,
      ephemeral: true
    });
  }
};
