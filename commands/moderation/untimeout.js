const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logAction.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove a timeout from a user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to remove timeout from')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

  async execute(interaction) {
    const member = interaction.options.getMember('user');

    if (!member) {
      const notFoundEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('Could not find the member.');
      return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
    }

    try {
      await member.timeout(null); // Remove timeout

      const successEmbed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`Timeout removed from <@${member.id}>.`);
      await interaction.reply({ embeds: [successEmbed], ephemeral: false });

      await logger.log(
        interaction.guild,
        'Timeout Removed',
        interaction.user,
        `Removed timeout from <@${member.id}> (${member.user.tag})`,
        'Moderation'
      );
    } catch (err) {
      console.error('Failed to remove timeout:', err);
      const failEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('Failed to remove timeout.');
      await interaction.reply({ embeds: [failEmbed], ephemeral: true });
    }
  }
};
