const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Delete a specific message by message ID in a given channel.')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel where the message is located')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('message_id')
        .setDescription('The ID of the message to delete')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const messageId = interaction.options.getString('message_id');

    if (!channel.isTextBased()) {
      return interaction.reply({ content: ' That channel is not text-based.', ephemeral: true });
    }

    try {
      const message = await channel.messages.fetch(messageId);
      await message.delete();

      // Logging
      const settingsPath = path.join(__dirname, '../../data/guildSettings.json');
      const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
      const logChannelId = settings[interaction.guildId]?.logChannelId;

      if (logChannelId) {
        const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
        if (logChannel?.isTextBased()) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(' Message Deleted')
            .addFields(
              { name: 'Author', value: `<@${message.author.id}> (${message.author.tag})`, inline: true },
              { name: 'Channel', value: `<#${channel.id}>`, inline: true },
              { name: 'Message ID', value: `\`${messageId}\`` }
            )
            .setTimestamp();

          await logChannel.send({ embeds: [embed] });
        }
      }

      await interaction.reply({ content: ` Message \`${messageId}\` deleted successfully.`, ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: ' Failed to delete message. Check ID and channel.', ephemeral: true });
    }
  }
};
