const logger = require('../utils/logAction.js');

module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (!message.guild || message.author?.bot) return;
    await logger.logMessage(message.guild, 'delete', message);
  }
};
