
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');

const REMINDER_FILE = path.join(__dirname, '../../data/reminders.json');
if (!fs.existsSync(REMINDER_FILE)) fs.writeFileSync(REMINDER_FILE, '[]');

function loadReminders() {
  return JSON.parse(fs.readFileSync(REMINDER_FILE));
}

function saveReminders(reminders) {
  fs.writeFileSync(REMINDER_FILE, JSON.stringify(reminders, null, 2));
}

function getNextOccurrence(day, time, timezone) {
  const now = DateTime.local().setZone(timezone);
  let next = now.set({ hour: time.hour, minute: time.minute, second: 0, millisecond: 0 });

  while (next.weekday !== day || next < now) {
    next = next.plus({ days: 1 });
  }
  return next;
}

function scheduleReminder(reminder, client) {
  const next = getNextOccurrence(reminder.dayOfWeek, reminder.time, reminder.timezone);
  const delay = next.toMillis() - DateTime.local().toMillis();

  setTimeout(async () => {
    const channel = await client.channels.fetch(reminder.channelId);
    if (channel?.isTextBased()) {
      const userPings = reminder.userIds.map(id => `<@${id}>`).join(' ');
      await channel.send(`${userPings}\n⏰ Weekly Reminder: **${reminder.message}**`);
    }
    scheduleReminder(reminder, client); // reschedule for next week
  }, delay);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remindweekly')
    .setDescription('Set a weekly clan war reminder on a specific day of the week.')
    .addStringOption(opt => opt.setName('message').setDescription('Reminder text').setRequired(true))
    .addIntegerOption(opt => opt.setName('weekday')
      .setDescription('Day of the week (1 = Monday, 7 = Sunday)')
      .setRequired(true))
    .addStringOption(opt => opt.setName('time')
      .setDescription('Time (24h format, e.g. 18:30)')
      .setRequired(true))
    .addStringOption(opt => opt.setName('timezone')
      .setDescription('Timezone (e.g. Australia/Sydney)')
      .setRequired(true))
    .addUserOption(opt => opt.setName('user1').setDescription('User to mention'))
    .addUserOption(opt => opt.setName('user2').setDescription('User to mention'))
    .addUserOption(opt => opt.setName('user3').setDescription('User to mention'))
    .addUserOption(opt => opt.setName('user4').setDescription('User to mention'))
    .addUserOption(opt => opt.setName('user5').setDescription('User to mention')),

  async execute(interaction) {
    const message = interaction.options.getString('message');
    const weekday = interaction.options.getInteger('weekday');
    const timeStr = interaction.options.getString('time');
    const timezone = interaction.options.getString('timezone');
    const users = ['user1', 'user2', 'user3', 'user4', 'user5']
      .map(k => interaction.options.getUser(k))
      .filter(Boolean);

    const [hour, minute] = timeStr.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute) || weekday < 1 || weekday > 7) {
      return interaction.reply({ content: '❌ Invalid input. Check weekday or time format.', ephemeral: true });
    }

    const reminder = {
      id: `${interaction.id}-${Date.now()}`,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      userIds: users.map(u => u.id),
      message,
      timezone,
      dayOfWeek: weekday,
      time: { hour, minute }
    };

    const all = loadReminders();
    all.push(reminder);
    saveReminders(all);
    scheduleReminder(reminder, interaction.client);

    await interaction.reply({
      content: `✅ Weekly reminder set for ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][weekday - 1]} at ${timeStr} (${timezone}) to ping ${users.map(u => u.username).join(', ')}`,
      ephemeral: true
    });
  },

  scheduleAll(client) {
    const all = loadReminders();
    all.forEach(r => {
      if (r.dayOfWeek && r.time && r.timezone) scheduleReminder(r, client);
    });
  }
};
