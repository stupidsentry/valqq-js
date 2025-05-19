const fs = require('fs');
const path = require('path');
const badwordsPath = path.join(__dirname, '../../data/badwords.json');

// Load per-guild bad word list
function getBadWords(guildId) {
  if (!fs.existsSync(badwordsPath)) return [];
  try {
    const allWords = JSON.parse(fs.readFileSync(badwordsPath));
    return allWords[guildId] || [];
  } catch {
    return [];
  }
}

// Convert leetspeak and normalise text
function normalise(text) {
  return text
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/@/g, 'a')
    .replace(/[^a-z]/g, '')       // remove non-letters
    .replace(/(.)\1+/g, '$1');    // collapse repeated letters
}

module.exports = {
  data: null,
  async monitor(message, client) {
    const badwords = getBadWords(message.guild.id);
    if (!badwords.length || !message.content) return;

    const original = message.content;
    const cleaned = normalise(original);

    const matchedWord = badwords.find(word => cleaned.includes(normalise(word)));

    if (matchedWord) {
      try {
        await message.delete();
        console.log(`[AUTOMOD] Deleted message for word: "${matchedWord}"`);

        // Send DM to user
        try {
          await message.author.send({
            content: `🚫 Your message in **${message.guild.name}** was removed for containing a disallowed word.\n\n**Matched Word:** \`${matchedWord}\`\n**Original Message:**\n\`\`\`${original}\`\`\``
          });
          console.log(`[AUTOMOD] DM sent to ${message.author.tag}`);
        } catch (dmErr) {
          console.warn(`[AUTOMOD] Could not DM ${message.author.tag}:`, dmErr.message);
        }

        // Log to moderation log channel
        const logger = require('../../utils/logAction.js');
        await logger.log(
          message.guild,
          '🛑 Automod: Obfuscated Bad Word',
          message.author,
          `Message deleted in <#${message.channel.id}>.\nMatched bypass of: \`${matchedWord}\`\n**Original Message:**\n\`\`\`${original}\`\`\``
        );
      } catch (err) {
        console.error('❌ Failed to delete or log bypassed message:', err);
      }
    }
  }
};
