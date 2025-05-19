const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

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
      return interaction.reply({ content: '❌ User not found or not in the server.', ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: '❌ I do not have permission to ban this user.', ephemeral: true });
    }

    await member.ban({ reason });

    // Optional log channel
    const settingsPath = require('path').join(__dirname, '../../data/guildSettings.json');
    const fs = require('fs');
    const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
    const logChannelId = settings[interaction.guildId]?.logChannelId;

    if (logChannelId) {
      const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
      if (logChannel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle(' Member Banned')
          .setColor('Red')
          .addFields(
            { name: 'User', value: `<@${target.id}> (${target.tag})`, inline: true },
            { name: 'Moderator', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
            { name: 'Reason', value: reason }
          )
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }
    }

    const responseEmbed = new EmbedBuilder()
  .setColor('Green')
  .setDescription(` <@${target.id}> has been banned.`);

await interaction.reply({ embeds: [responseEmbed], ephemeral: false });

  }
};

