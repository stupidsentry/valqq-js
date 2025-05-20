const fs = require('fs');
const path = require('path');
const { EmbedBuilder, Events } = require('discord.js');
const logAction = require('../utils/logAction.js');

const SETTINGS_FILE = path.join(__dirname, '../data/welcomeSettings.json');

module.exports = (client) => {
  // 🔹 On Member Join
  client.on(Events.GuildMemberAdd, async (member) => {
    await logAction.logJoinLeave(member.guild, member, 'join');

    if (!fs.existsSync(SETTINGS_FILE)) return;
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE));
    const config = settings[member.guild.id];
    if (!config) return;

    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel || !channel.isTextBased()) return;

    const title = config.title || '👋 Welcome!';
    const message = config.message || 'Welcome, {user}!';
    const color = config.color || '#5865F2';

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(message.replace('{user}', `<@${member.id}>`))
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
  });

  // 🔹 On Member Leave
  client.on(Events.GuildMemberRemove, async (member) => {
    await logAction.logJoinLeave(member.guild, member, 'leave');

    if (!fs.existsSync(SETTINGS_FILE)) return;
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE));
    const config = settings[member.guild.id];
    if (!config) return;

    const channel = member.guild.channels.cache.get(config.leaveChannelId);
    if (!channel || !channel.isTextBased()) return;

    const leaveTitle = config.leaveTitle || '👋 Member Left';
    const leaveMessage = config.leaveMessage || '{user} has left the server.';
    const leaveColor = config.leaveColor || '#e67e22';

    const embed = new EmbedBuilder()
      .setColor(leaveColor)
      .setTitle(leaveTitle)
      .setDescription(leaveMessage.replace('{user}', `<@${member.id}>`))
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  });
};
