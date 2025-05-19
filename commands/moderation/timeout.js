const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logAction.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Temporarily timeout a user from interacting.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to timeout')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in minutes')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      const notFound = new EmbedBuilder()
        .setColor('Red')
        .setDescription('User not found in this server.');
      return await interaction.reply({ embeds: [notFound], ephemeral: true });
    }

    if (!member.moderatable) {
      const cannotTimeout = new EmbedBuilder()
        .setColor('Red')
        .setDescription('I do not have permission to timeout this user.');
      return await interaction.reply({ embeds: [cannotTimeout], ephemeral: true });
    }

    const ms = duration * 60 * 1000;
    const until = `<t:${Math.floor((Date.now() + ms) / 1000)}:f>`;

    try {
      await member.timeout(ms, reason);

      const logEmbed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle('⏱️ Timeout Issued')
        .addFields(
          { name: 'User', value: `<@${member.id}> (${member.user.tag})`, inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Duration', value: `${duration} minute(s)`, inline: true },
          { name: 'Until', value: until, inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();

      // Log using existing logger utility
      await logger.log(
        interaction.guild,
        '⏱️ Timeout Issued',
        interaction.user,
        `Timed out <@${member.id}> (${member.user.tag}) for **${duration}** minute(s).\n**Reason:** ${reason}\n**Until:** ${until}`,
        'Moderation'
      );

      const successEmbed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`<@${member.id}> has been timed out for **${duration} minute(s)**.`);

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });

    } catch (error) {
      console.error('Failed to timeout:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('Failed to apply timeout.');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
