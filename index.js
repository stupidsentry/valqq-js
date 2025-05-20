require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Events,
  REST,
  Routes
} = require('discord.js');

const settingsManager = require('./utils/settingsManager.js');
const logAction = require('./utils/logAction.js');

// 📦 Create the Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// 📁 Load settings
client.settings = settingsManager.load();
client.saveSettings = settingsManager.save;

// 📁 Load commands
client.commands = new Collection();
function loadCommands(dir = path.join(__dirname, 'commands')) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      loadCommands(fullPath);
    } else if (file.name.endsWith('.js')) {
      const command = require(fullPath);
      if (command?.data?.name) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.warn(`⚠️ Skipped invalid command file: ${file.name}`);
      }
    }
  }
}
loadCommands();

// 📁 Load events
const eventsPath = path.join(__dirname, 'events');
fs.readdirSync(eventsPath).forEach(file => {
  const fullPath = path.join(eventsPath, file);
  const event = require(fullPath);

  if (typeof event === 'function') {
    client.on(file.split('.')[0], (...args) => event(...args, client));
  } else if (event.name && typeof event.execute === 'function') {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// ✅ Client ready
client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // 🔧 Register slash commands globally
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    const commandData = [...client.commands.values()]
      .filter(cmd => typeof cmd.data?.toJSON === 'function')
      .map(cmd => cmd.data.toJSON());

    console.log('Registering global slash commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commandData
    });
    console.log('✅ Slash commands registered.');
  } catch (err) {
    console.error('❌ Command registration error:', err);
  }

  // 🟢 Set bot presence
  client.user.setPresence({
    status: 'idle',
    activities: [{ name: 'Blade Ball Clan ⚔️', type: 3 }]
  });

  // 🚀 Send startup webhook
  try {
    const pingUrl = process.env.STARTUP_PING_URL;
    if (pingUrl) {
      await axios.post(pingUrl, {
        content: `**Valqq Bot is now online**\n> Started at \`${new Date().toLocaleString()}\``
      });
      console.log('✅ Startup ping sent.');
    } else {
      console.warn('⚠️ No STARTUP_PING_URL defined.');
    }
  } catch (err) {
    console.error('❌ Failed to send startup ping:', err.message);
  }

  // 📶 Send uptime heartbeat every 60 seconds
  const heartbeatUrl = process.env.HEARTBEAT_URL;
  if (heartbeatUrl) {
    setInterval(async () => {
      try {
        await axios.post(heartbeatUrl, {
          embeds: [
            {
              title: '📶 Uptime Heartbeat',
              description: `Valqq is still online and responsive.`,
              color: 0x2ecc71,
              timestamp: new Date().toISOString()
            }
          ]
        });
        console.log('✅ Uptime heartbeat sent.');
      } catch (err) {
        console.error('❌ Heartbeat webhook failed:', err.message);
      }
    }, 60_0000); // 60 seconds
  }

  // ⏰ Schedule reminders
  try {
    const remind = require('./commands/clan/remind.js');
    const remindWeekly = require('./commands/clan/remindweekly.js');
    remind?.scheduleAll?.(client);
    remindWeekly?.scheduleAll?.(client);
  } catch (err) {
    console.error('❌ Reminder scheduling error:', err.message);
  }
});

// 🔑 Login to Discord
client.login(process.env.TOKEN);
