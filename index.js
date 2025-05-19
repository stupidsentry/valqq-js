require('dotenv').config();
const fs = require('fs');
const path = require('path');
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
const logger = require('./utils/logAction.js');

// Discord client 
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// Load settings
client.settings = settingsManager.load();
client.saveSettings = settingsManager.save;

// Load commands
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

// Load events
const eventsPath = path.join(__dirname, 'events');
fs.readdirSync(eventsPath).forEach(file => {
  const event = require(path.join(eventsPath, file));
  const eventName = file.split('.')[0];

  if (typeof event === 'function') {
    client.on(eventName, (...args) => event(...args, client));
  } else if (event.name && typeof event.execute === 'function') {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// Ready event
client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // slash commands globally
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    const commandData = [...client.commands.values()]
      .filter(cmd => typeof cmd.data?.toJSON === 'function')
      .map(cmd => cmd.data.toJSON());

    console.log('Registering global slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commandData }
    );
    console.log('Slash commands registered.');
  } catch (err) {
    console.error('Command registration error:', err);
  }

  // bot presence
  client.user.setPresence({
    status: 'idle',
    activities: [{ name: 'Blade Ball Clan ⚔️', type: 3 }]
  });

  // Log bot startup
  try {
    const testGuild = client.guilds.cache.first();
    if (testGuild) {
      await logger.log(
        testGuild,
        'Bot Active',
        client.user,
        'Valqq is still online and ready.'
      );
    }
  } catch (err) {
    console.warn('Startup log failed:', err.message);
  }

  // Schedule reminders
  try {
    const remind = require('./commands/clan/remind.js');
    const remindWeekly = require('./commands/clan/remindweekly.js');
    remind?.scheduleAll?.(client);
    remindWeekly?.scheduleAll?.(client);
  } catch (err) {
    console.error('Reminder scheduling error:', err.message);
  }
});

// Start the bot
client.login(process.env.TOKEN);
