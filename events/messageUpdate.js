const logger = require('../utils/logAction.js');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    newMessage.oldContent = oldMessage.content;
    newMessage.newContent = newMessage.content;
    await logger.logMessage(newMessage.guild, 'edit', newMessage);
  }
};
