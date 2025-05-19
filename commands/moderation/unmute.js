const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logAction.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove the "Muted" role from a user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to unmute')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers),

  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');

    if (!member || !muteRole) {
      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('Member or "Muted" role not found.');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!member.roles.cache.has(muteRole.id)) {
      const notMutedEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription('This user is not currently muted.');
      return interaction.reply({ embeds: [notMutedEmbed], ephemeral: true });
    }

    try {
      await member.roles.remove(muteRole);

      const successEmbed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`<@${member.id}> has been unmuted.`);
      await interaction.reply({ embeds: [successEmbed], ephemeral: false });

      await logger.log(
        interaction.guild,
        '🔈 Unmute',
        interaction.user,
        `Unmuted <@${member.id}> (${member.user.tag})`,
        'Moderation'
      );
    } catch (err) {
      console.error('Failed to unmute:', err);
      const failEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('Failed to unmute the user.');
      await interaction.reply({ embeds: [failEmbed], ephemeral: true });
    }
  }
};
