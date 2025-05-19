const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages by amount or after a specific message.')
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Delete this many recent messages (1–400)'))
    .addStringOption(opt =>
      opt.setName('after_message_id')
        .setDescription('Delete up to 400 messages after this message ID'))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const afterMessageId = interaction.options.getString('after_message_id');
    const channel = interaction.channel;

    if (!channel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('This command can only be used in text-based channels.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ✅ Require exactly one option
    if ((amount && afterMessageId) || (!amount && !afterMessageId)) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('You must provide **either** `amount` or `after messageid`, not both.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    let messagesToDelete;
    try {
      if (afterMessageId) {
        const afterMessage = await channel.messages.fetch(afterMessageId);
        const fetched = await channel.messages.fetch({ after: afterMessage.id, limit: 400 });
        messagesToDelete = fetched.filter(msg => (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000);
        await channel.bulkDelete(messagesToDelete, true);
      } else {
        if (amount < 1 || amount > 400) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(' Please enter an amount between 1 and 400.');
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        messagesToDelete = await channel.bulkDelete(amount, true);
      }
    } catch (err) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(' Failed to delete messages. Check the message ID or age of the messages.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ✅ Log channel
    const settingsPath = path.join(__dirname, '../../data/guildSettings.json');
    const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
    const logChannelId = settings[interaction.guildId]?.logChannelId;

    if (logChannelId) {
      const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
      if (logChannel?.isTextBased()) {
        const logEmbed = new EmbedBuilder()
          .setColor('DarkBlue')
          .setTitle(' Message Purge')
          .addFields(
            { name: 'Messages Deleted', value: `${messagesToDelete.size}`, inline: true },
            { name: 'Channel', value: `<#${channel.id}>`, inline: true },
            { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true }
          )
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
      }
    }

    const successEmbed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(` Deleted ${messagesToDelete.size} message(s).`);

    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
  }
};
