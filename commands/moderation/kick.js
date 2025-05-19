const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server.')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to kick')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('User not found or not in the server.');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!member.kickable) {
      const permissionEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(' I do not have permission to kick this user.');
      return interaction.reply({ embeds: [permissionEmbed], ephemeral: true });
    }

    try {
      await member.kick(reason);

      // Optional log channel
      const settingsPath = path.join(__dirname, '../../data/guildSettings.json');
      const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
      const logChannelId = settings[interaction.guildId]?.logChannelId;

      if (logChannelId) {
        const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
        if (logChannel?.isTextBased()) {
          const logEmbed = new EmbedBuilder()
            .setColor('Orange')
            .setTitle(' Member Kicked')
            .addFields(
              { name: 'User', value: `<@${targetUser.id}> (${targetUser.tag})`, inline: true },
              { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Reason', value: reason }
            )
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      const successEmbed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(` <@${targetUser.id}> has been kicked.`);

      await interaction.reply({ embeds: [successEmbed], ephemeral: false });
    } catch (err) {
      const failEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(' Failed to kick the user.');
      await interaction.reply({ embeds: [failEmbed], ephemeral: true });
    }
  }
};
