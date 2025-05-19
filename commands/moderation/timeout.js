const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const logger = require('../../utils/logAction.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Temporarily timeout a user from interacting')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to timeout')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in minutes')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      return await interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    }

    const ms = duration * 60 * 1000;
    const until = `<t:${Math.floor((Date.now() + ms) / 1000)}:f>`;

    try {
      await member.timeout(ms, reason);

      await logger.log(
        interaction.guild,
        '⏱️ Timeout Issued',
        interaction.user,
        `Timed out <@${member.id}> (${member.user.tag}) for **${duration}** minute(s).\n**Reason:** ${reason}\n**Until:** ${until}`,
        'Moderation'
      );

      await interaction.reply({
        content: `✅ Timed out ${member.user.tag} for **${duration}** minute(s).`,
        ephemeral: true
      });
    } catch (error) {
      console.error('❌ Failed to timeout:', error);
      await interaction.reply({ content: '❌ Failed to apply timeout.', ephemeral: true });
    }
  }
};
