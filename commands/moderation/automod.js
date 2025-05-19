const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    // Load server settings
    const settingsPath = path.join(__dirname, '../../data/guildSettings.json');
    const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
    const guildSettings = settings[message.guild.id];

    if (!guildSettings || !guildSettings.badWords || !guildSettings.logChannelId) return;

    const badWords = guildSettings.badWords.map(word => word.toLowerCase());
    const content = message.content.toLowerCase();

    // Check for bad words
    if (badWords.some(word => content.includes(word))) {
      await message.delete().catch(() => null);

      const logChannel = await message.guild.channels.fetch(guildSettings.logChannelId).catch(() => null);
      if (logChannel && logChannel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Auto-Moderation Triggered')
          .addFields(
            { name: 'User', value: `<@${message.author.id}> (${message.author.tag})`, inline: true },
            { name: 'Reason', value: 'Banned word detected.', inline: true },
            { name: 'Message Content', value: message.content || 'N/A' }
          )
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }
    }
  }
};
