
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const SETTINGS_PATH = path.join(__dirname, '../data/guildSettings.json');


function getLogChannelId(guildId) {
  if (!fs.existsSync(SETTINGS_PATH)) return null;
  const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH));
  return settings[guildId]?.logChannelId || null;
}

async function sendLog(guild, embed) {
  const logChannelId = getLogChannelId(guild.id);
  if (!logChannelId) return;

  const channel = await guild.channels.fetch(logChannelId).catch(() => null);
  if (channel?.isTextBased()) {
    await channel.send({ embeds: [embed] });
  }
}

module.exports = {
  async log(guild, title, actor, description, category = 'Moderation') {
    const embed = new EmbedBuilder()
      .setTitle(`📘 ${title}`)
      .setDescription(description)
      .setColor(0x5865f2)
      .addFields({ name: 'Category', value: category })
      .setTimestamp();

    if (actor) {
      embed.setFooter({ text: `Actor: ${actor.tag || actor.username || actor.id}` });
    }

    await sendLog(guild, embed);
  },

  async logMessage(guild, type, message) {
    const embed = new EmbedBuilder()
      .setColor(type === 'edit' ? 0xf1c40f : 0xe74c3c)
      .setTimestamp();

    if (type === 'delete') {
      embed
        .setTitle('🗑️ Message Deleted')
        .setDescription(`Message from <@${message.author?.id}> in <#${message.channel.id}>`)
        .addFields({ name: 'Content', value: message.content || '*No content*' });
    }

    if (type === 'edit') {
      embed
        .setTitle('Message Edited')
        .setDescription(`Edited by <@${message.author?.id}> in <#${message.channel.id}>`)
        .addFields(
          { name: 'Before', value: message.oldContent || '*Unknown*' },
          { name: 'After', value: message.newContent || '*Unknown*' }
        );
    }

    await sendLog(guild, embed);
  },

  async logJoinLeave(guild, member, action = 'join') {
    const embed = new EmbedBuilder()
      .setTitle(action === 'join' ? '👤 Member Joined' : '🚪 Member Left')
      .setColor(action === 'join' ? 0x2ecc71 : 0xe67e22)
      .setDescription(`<@${member.id}> (${member.user?.tag || member.id})`)
      .setTimestamp();

    await sendLog(guild, embed);
  }
};
