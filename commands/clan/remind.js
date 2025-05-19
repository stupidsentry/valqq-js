const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

const REMINDERS_FILE = path.join(__dirname, '../../data/reminders.json');
if (!fs.existsSync(REMINDERS_FILE)) fs.writeFileSync(REMINDERS_FILE, '{}');

function loadReminders() {
  return JSON.parse(fs.readFileSync(REMINDERS_FILE));
}

function saveReminders(data) {
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(data, null, 2));
}

function scheduleReminder(guildId, reminder, client) {
  const date = new Date(reminder.datetime);
  if (date < new Date()) return;

  schedule.scheduleJob(date, async () => {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) return;

    const channel = await guild.channels.fetch(reminder.channel).catch(() => null);
    if (!channel?.isTextBased()) return;

    await channel.send({
      content: `${reminder.users.map(id => `<@${id}>`).join(' ')}`,
      embeds: [{
        title: '⏰ Reminder',
        description: reminder.message,
        color: 0x3498db,
        timestamp: new Date().toISOString()
      }]
    });
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a one-time reminder that pings users.')
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('Reminder message')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('date')
        .setDescription('Date (YYYY-MM-DD)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('time')
        .setDescription('Time (HH:MM in 24h)')
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName('user1').setDescription('Pinged user 1').setRequired(true))
    .addUserOption(opt =>
      opt.setName('user2').setDescription('Pinged user 2'))
    .addUserOption(opt =>
      opt.setName('user3').setDescription('Pinged user 3'))
    .addUserOption(opt =>
      opt.setName('user4').setDescription('Pinged user 4'))
    .addUserOption(opt =>
      opt.setName('user5').setDescription('Pinged user 5'))
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel to send reminder')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction, client) {
    const msg = interaction.options.getString('message');
    const date = interaction.options.getString('date');
    const time = interaction.options.getString('time');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const users = ['user1', 'user2', 'user3', 'user4', 'user5']
      .map(k => interaction.options.getUser(k))
      .filter(u => u)
      .map(u => u.id);

    const datetime = new Date(`${date}T${time}:00`);
    if (datetime.toString() === 'Invalid Date' || datetime < new Date()) {
      return interaction.reply({ content: '❌ Invalid or past date/time.', ephemeral: true });
    }

    const reminders = loadReminders();
    if (!reminders[interaction.guildId]) reminders[interaction.guildId] = [];
    reminders[interaction.guildId].push({
      message: msg,
      datetime,
      users,
      channel: channel.id
    });

    saveReminders(reminders);
    scheduleReminder(interaction.guildId, reminders[interaction.guildId].slice(-1)[0], client);

    await interaction.reply({
      content: `✅ Reminder set for ${date} at ${time} in ${channel}.`,
      ephemeral: true
    });
  },

  scheduleAll(client) {
    const reminders = loadReminders();
    for (const guildId in reminders) {
      for (const reminder of reminders[guildId]) {
        scheduleReminder(guildId, reminder, client);
      }
    }
  }
};
