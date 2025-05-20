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
    .setName('configleave')
    .setDescription('Configure the leave embed for when a member leaves.')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel to send the leave message in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('title')
        .setDescription('Embed title for the leave message')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('description')
        .setDescription('Embed description (use {user} to mention the member)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('color')
        .setDescription('Hex colour code (e.g. #e74c3c)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const message = interaction.options.getString('description');
    const color = interaction.options.getString('color') || '#e74c3c';

    const settings = loadSettings();
    const guildId = interaction.guildId;

    // Preserve existing welcome settings
    const existing = settings[guildId] || {};

    settings[guildId] = {
      ...existing,
      leaveChannelId: channel.id,
      leaveTitle: title,
      leaveMessage: message,
      leaveColor: color
    };

    saveSettings(settings);

    // Preview the embed using interaction user
    const previewEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(message.replace('{user}', `<@${interaction.user.id}>`))
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({
      content: `Leave configuration saved. The message will be sent in <#${channel.id}> when a member leaves.`,
      embeds: [previewEmbed],
      ephemeral: true
    });
  }
};
