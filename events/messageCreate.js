module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author?.bot) return;

    //console.log(`[EVENT] MessageCreate triggered: "${message.content}" by ${message.author.tag}`);

    try {
      const automod = require('../commands/moderation/automod.js');
      if (automod?.monitor) {
        await automod.monitor(message, client);
      }
    } catch (err) {
      console.error('❌ Automod error:', err);
    }
  }
};
