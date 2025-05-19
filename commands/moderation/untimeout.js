const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove a timeout from a user')
    .addUserOption(option =>
      option.setName('user').setDescription('The user to remove timeout from').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

  async execute(interaction) {
    const member = interaction.options.getMember('user');

    if (!member) {
      return interaction.reply({ content: '❌ Could not find the member.', ephemeral: true });
    }

    try {
      await member.timeout(null); // removes timeout
      await interaction.reply({ content: `✅ Timeout removed from ${member.user.tag}.`, ephemeral: true });

      const logger = require('../../utils/logAction');
      await logger.log(interaction.guild, 'Timeout Removed', interaction.user, `Removed timeout from <@${member.id}>`, 'Moderation');
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Failed to remove timeout.', ephemeral: true });
    }
  }
};
