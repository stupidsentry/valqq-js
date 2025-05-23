const { SlashCommandBuilder, ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../../data/welcomeSettings.json');
if (!fs.existsSync(SETTINGS_FILE)) fs.writeFileSync(SETTINGS_FILE, '{}');

function loadSettings() {
  return JSON.parse(fs.readFileSync(SETTINGS_FILE));
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configwelcome')
    .setDescription('Configure the welcome embed for new members.')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel to send the welcome message in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('title')
        .setDescription('Embed title')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('description')
        .setDescription('Embed description (use {user} to mention the new member)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('color')
        .setDescription('Hex colour code (e.g. #5865F2)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const message = interaction.options.getString('description');
    const color = interaction.options.getString('color') || '#5865F2';

    const settings = loadSettings();
    const guildId = interaction.guildId;

    // Preserve existing leaveMessage if set
    const existing = settings[guildId] || {};

    settings[guildId] = {
      ...existing,
      welcomeChannelId: channel.id,
      title,
      message,
      color
    };

    saveSettings(settings);

    const previewEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(message.replace('{user}', `<@${interaction.user.id}>`))
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({
      embeds: [previewEmbed],
      content: `✅ Welcome configuration saved. The message will be sent in <#${channel.id}> when a new user joins.`,
      ephemeral: true
    });
  }
};
