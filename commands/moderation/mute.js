const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

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
      return interaction.reply({ content: '❌ User not found or not in the server.', ephemeral: true });
    }

    if (!member.moderatable) {
      return interaction.reply({ content: '❌ I do not have permission to mute this user.', ephemeral: true });
    }

    const ms = duration * 60 * 1000;
    await member.timeout(ms, reason);

    // Logging
    const settingsPath = require('path').join(__dirname, '../../data/guildSettings.json');
    const fs = require('fs');
    const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
    const logChannelId = settings[interaction.guildId]?.logChannelId;

    if (logChannelId) {
      const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
      if (logChannel?.isTextBased()) {
        await logChannel.send(`🔇 **Mute**: <@${target.id}> was muted by <@${interaction.user.id}> for **${duration} minute(s)**\n📄 Reason: ${reason}`);
      }
    }

    await interaction.reply({ content: `✅ <@${target.id}> has been muted for **${duration} minute(s)**.`, ephemeral: false });
  }
};
