
const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const WARNINGS_FILE = path.join(__dirname, '../../data/warnings.json');
if (!fs.existsSync(WARNINGS_FILE)) fs.writeFileSync(WARNINGS_FILE, '{}');

function loadWarnings() {
  return JSON.parse(fs.readFileSync(WARNINGS_FILE));
}

function saveWarnings(warnings) {
  fs.writeFileSync(WARNINGS_FILE, JSON.stringify(warnings, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user and log the reason.')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to warn')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const warnings = loadWarnings();

    if (!warnings[interaction.guildId]) {
      warnings[interaction.guildId] = {};
    }

    if (!warnings[interaction.guildId][target.id]) {
      warnings[interaction.guildId][target.id] = [];
    }

    warnings[interaction.guildId][target.id].push({
      moderator: interaction.user.id,
      reason,
      timestamp: new Date().toISOString()
    });

    saveWarnings(warnings);

    // Logging
    const settingsPath = path.join(__dirname, '../../data/guildSettings.json');
    const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
    const logChannelId = settings[interaction.guildId]?.logChannelId;

    if (logChannelId) {
      const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
      if (logChannel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle('⚠️ User Warned')
          .setDescription(`<@${target.id}> was warned by <@${interaction.user.id}>`)
          .addFields({ name: 'Reason', value: reason })
          .setColor(0xf1c40f)
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      }
    }

    await interaction.reply({ content: `✅ <@${target.id}> has been warned for: ${reason}`, ephemeral: false });
  }
};
