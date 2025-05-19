const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout (mute) a member for a specified duration.')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to mute')
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('duration')
        .setDescription('Duration in minutes')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for mute')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('User not found or not in the server.');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!member.moderatable) {
      const permissionEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('I do not have permission to mute this user.');
      return interaction.reply({ embeds: [permissionEmbed], ephemeral: true });
    }

    try {
      const ms = duration * 60 * 1000;
      await member.timeout(ms, reason);

      // Optional log channel
      const settingsPath = path.join(__dirname, '../../data/guildSettings.json');
      const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
      const logChannelId = settings[interaction.guildId]?.logChannelId;

      if (logChannelId) {
        const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
        if (logChannel?.isTextBased()) {
          const logEmbed = new EmbedBuilder()
            .setColor('Orange')
            .setTitle('Member Muted')
            .addFields(
              { name: 'User', value: `<@${target.id}> (${target.tag})`, inline: true },
              { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Duration', value: `${duration} minute(s)`, inline: true },
              { name: 'Reason', value: reason }
            )
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      const successEmbed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`<@${target.id}> has been muted for **${duration} minute(s)**.`);
      await interaction.reply({ embeds: [successEmbed], ephemeral: false });

    } catch (err) {
      const failEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('Failed to mute the user.');
      await interaction.reply({ embeds: [failEmbed], ephemeral: true });
    }
  }
};
