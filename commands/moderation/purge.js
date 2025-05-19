const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages in a channel.')
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Number of messages to delete (1–400)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('after_message_id')
        .setDescription('(Optional) Start purging after this message ID'))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const afterMessageId = interaction.options.getString('after_message_id');
    const channel = interaction.channel;

    if (amount < 1 || amount > 400) {
      const invalidAmount = new EmbedBuilder()
        .setColor('Red')
        .setDescription(' Please enter a number between 1 and 400.');
      return interaction.reply({ embeds: [invalidAmount], ephemeral: true });
    }

    if (!channel.isTextBased()) {
      const invalidChannel = new EmbedBuilder()
        .setColor('Red')
        .setDescription(' This command can only be used in text-based channels.');
      return interaction.reply({ embeds: [invalidChannel], ephemeral: true });
    }

    let messagesToDelete;
    try {
      if (afterMessageId) {
        // Fetch and delete messages after a given ID
        const afterMessage = await channel.messages.fetch(afterMessageId);
        const allMessages = await channel.messages.fetch({ after: afterMessage.id, limit: amount });
        messagesToDelete = allMessages.filter(msg => (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000);

        await channel.bulkDelete(messagesToDelete, true);
      } else {
        // Bulk delete most recent messages
        messagesToDelete = await channel.bulkDelete(amount, true);
      }
    } catch (err) {
      const failEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(' Failed to delete messages. Check that the message ID is valid and messages are not older than 14 days.');
      return interaction.reply({ embeds: [failEmbed], ephemeral: true });
    }

    // Logging
    const settingsPath = path.join(__dirname, '../../data/guildSettings.json');
    const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
    const logChannelId = settings[interaction.guildId]?.logChannelId;

    if (logChannelId) {
      const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
      if (logChannel?.isTextBased()) {
        await logChannel.send(` **Purge**: ${messagesToDelete.size} messages deleted in <#${channel.id}> by <@${interaction.user.id}>`);
      }
    }

    const successEmbed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(` Deleted ${messagesToDelete.size} message(s).`);

    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
  }
};
