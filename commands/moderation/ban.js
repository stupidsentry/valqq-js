const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const logAction = require('../../utils/logAction.js'); // ✅ import the logger

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server.')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to ban')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: 'User not found or not in the server.', ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: 'I do not have permission to ban this user.', ephemeral: true });
    }

    await member.ban({ reason });

    // ✅ Log the ban using logAction
    await logAction.log(
      interaction.guild,
      'Member Banned',
      interaction.user,
      `**User:** <@${target.id}> (${target.tag})\n**Reason:** ${reason}`,
      'Moderation'
    );

    // ✅ Acknowledge to moderator
    const responseEmbed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(`<@${target.id}> has been banned.`);

    await interaction.reply({ embeds: [responseEmbed] });
  }
};
