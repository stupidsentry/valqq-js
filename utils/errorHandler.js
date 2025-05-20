const { WebhookClient, EmbedBuilder } = require('discord.js');

const webhook = process.env.ERROR_WEBHOOK_URL
  ? new WebhookClient({ url: process.env.ERROR_WEBHOOK_URL })
  : null;

const severityColors = {
  INFO: 0x3498db,     // Blue
  WARNING: 0xf1c40f,  // Yellow
  CRITICAL: 0xe74c3c  // Red
};

function formatErrorLink(guildId, channelId, messageId) {
  if (guildId && channelId && messageId) {
    return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
  }
  return null;
}

/**
 * Report an error or log message with a severity level.
 * @param {Client} client - The Discord client.
 * @param {Error|string} error - The error or message.
 * @param {Object} context - Contextual information (guild, channel, messageId).
 * @param {'INFO' | 'WARNING' | 'CRITICAL'} level - Severity level.
 */
async function reportError(client, error, context = {}, level = 'CRITICAL') {
  const severity = level.toUpperCase();
  const colour = severityColors[severity] || 0x95a5a6;

  const isError = error instanceof Error;
  const message = isError ? error.message : String(error);
  const stack = isError && error.stack ? `\`\`\`\n${error.stack.slice(0, 1000)}\n\`\`\`` : null;

  const embed = new EmbedBuilder()
    .setTitle(`${severity} ${isError ? 'Error' : 'Log'}`)
    .setDescription(`\`\`\`${message}\`\`\``)
    .setColor(colour)
    .setTimestamp();

  if (stack && severity === 'CRITICAL') {
    embed.addFields({ name: 'Stack Trace', value: stack });
  }

  if (context.guild && context.channel && context.messageId) {
    const jumpLink = formatErrorLink(context.guild.id, context.channel.id, context.messageId);
    embed.addFields({ name: 'Jump to Message', value: `[Click here](${jumpLink})` });
  }

  // Prefer webhook
  if (webhook) {
    try {
      await webhook.send({ embeds: [embed] });
    } catch (hookErr) {
      console.warn('⚠️ Failed to send webhook log:', hookErr.message);
    }
  } else if (context.channel?.send) {
    try {
      await context.channel.send({ embeds: [embed] });
    } catch (msgErr) {
      console.warn('⚠️ Failed to send error to channel:', msgErr.message);
    }
  }

  // Always log locally
  const prefix = `[${severity}]`;
  console[severity === 'INFO' ? 'log' : severity === 'WARNING' ? 'warn' : 'error'](`${prefix} ${message}`);
}

module.exports = reportError;
