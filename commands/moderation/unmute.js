const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove the mute role from a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to unmute').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers),

  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');

    if (!member || !muteRole) {
      return interaction.reply({ content: '❌ Member or mute role not found.', ephemeral: true });
    }

    if (!member.roles.cache.has(muteRole.id)) {
      return interaction.reply({ content: '❌ This user is not muted.', ephemeral: true });
    }

    try {
      await member.roles.remove(muteRole);
      await interaction.reply({ content: `✅ Unmuted ${member.user.tag}.`, ephemeral: true });

      const logger = require('../../utils/logAction');
      await logger.log(interaction.guild, 'Unmute', interaction.user, `Unmuted <@${member.id}>`, 'Moderation');
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Failed to unmute user.', ephemeral: true });
    }
  }
};
