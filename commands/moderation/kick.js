
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

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
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: '❌ User not found or not in the server.', ephemeral: true });
    }

    if (!member.kickable) {
      return interaction.reply({ content: '❌ I do not have permission to kick this user.', ephemeral: true });
    }

    await member.kick(reason);

    // Logging
    const settingsPath = require('path').join(__dirname, '../../data/guildSettings.json');
    const fs = require('fs');
    const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
    const logChannelId = settings[interaction.guildId]?.logChannelId;

    if (logChannelId) {
      const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
      if (logChannel?.isTextBased()) {
        await logChannel.send(`🥾 **Kick**: <@${target.id}> was kicked by <@${interaction.user.id}>\n📄 Reason: ${reason}`);
      }
    }

    await interaction.reply({ content: `✅ <@${target.id}> has been kicked.`, ephemeral: false });
  }
};
