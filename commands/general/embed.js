
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send a custom embedded message')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the embed')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description/content of the embed')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the embed to')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    if (!targetChannel.isTextBased()) {
      return interaction.reply({ content: '❌ That channel is not text-based.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(title.slice(0, 256))
      .setDescription(description.slice(0, 4000))
      .setColor(0x5865f2)
      .setTimestamp();

    await targetChannel.send({ embeds: [embed] });

    await interaction.reply({ content: `✅ Embed sent to ${targetChannel}`, ephemeral: true });
  }
};
