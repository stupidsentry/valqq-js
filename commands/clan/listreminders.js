const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');

const REMINDER_FILE = path.join(__dirname, '../../data/reminders.json');
const TIMEZONE_FILE = path.join(__dirname, '../../data/timezoneSettings.json');

function loadReminders() {
  if (!fs.existsSync(REMINDER_FILE)) return [];
  return JSON.parse(fs.readFileSync(REMINDER_FILE));
}

function loadTimezones() {
  if (!fs.existsSync(TIMEZONE_FILE)) return {};
  return JSON.parse(fs.readFileSync(TIMEZONE_FILE));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listreminders')
    .setDescription('List all upcoming reminders for this server'),

  async execute(interaction) {
    const all = loadReminders();
    const timezones = loadTimezones();
    const guildReminders = all.filter(r => r.guildId === interaction.guildId);

    const timezone = timezones[interaction.guildId] || 'Australia/Sydney';

    if (guildReminders.length === 0) {
      return interaction.reply({ content: '📭 No reminders found for this server.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('⏰ Upcoming Reminders')
      .setColor(0x0099ff)
      .setFooter({ text: `Timezone: ${timezone}` });

    for (const r of guildReminders.slice(0, 14)) {
      const time = DateTime.fromISO(r.datetime || '', {
        zone: r.timezone || timezone
      });

      const when = time.isValid
        ? `${time.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)} (${time.zoneName})`
        : 'Unknown time';

      const users = r.userIds?.map(id => `<@${id}>`).join(', ') || 'No pings';

      embed.addFields({ name: r.message, value: `🕒 ${when}\n👥 ${users}` });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
