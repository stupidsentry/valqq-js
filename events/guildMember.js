const logger = require('../utils/logAction.js');

module.exports.guildMemberAdd = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    await logger.logJoinLeave(member.guild, member, 'join');
  }
};

module.exports.guildMemberRemove = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    await logger.logJoinLeave(member.guild, member, 'leave');
  }
};
