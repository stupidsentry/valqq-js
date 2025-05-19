
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages in a channel.')
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Number of messages to delete (max 100)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ Please enter a number between 1 and 100.', ephemeral: true });
    }

    const channel = interaction.channel;
    if (!channel.isTextBased()) {
      return interaction.reply({ content: '❌ This command can only be used in text-based channels.', ephemeral: true });
    }

    const messages = await channel.bulkDelete(amount, true).catch(() => null);
    if (!messages) {
      return interaction.reply({ content: '❌ Failed to delete messages. Messages older than 14 days cannot be deleted.', ephemeral: true });
    }

    // Logging
    const settingsPath = require('path').join(__dirname, '../../data/guildSettings.json');
    const fs = require('fs');
    const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
    const logChannelId = settings[interaction.guildId]?.logChannelId;

    if (logChannelId) {
      const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
      if (logChannel?.isTextBased()) {
        await logChannel.send(`🧹 **Purge**: ${messages.size} messages deleted in <#${channel.id}> by <@${interaction.user.id}>`);
      }
    }

    await interaction.reply({ content: `✅ Deleted ${messages.size} message(s).`, ephemeral: true });
  }
};
