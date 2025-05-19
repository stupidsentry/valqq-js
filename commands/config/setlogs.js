const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
  InteractionResponseType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogs')
    .setDescription('Set the log channel for moderation and message logs')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send logs to')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interaction) {
    try {
      // ✅ SAFELY defer reply early
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ flags: 64 }); // ephemeral true → flags: 64
      }

      const channel = interaction.options.getChannel('channel');

      // ✅ Use cached settings object
      const settings = interaction.client.settings || {};
      settings[interaction.guildId] = {
        ...(settings[interaction.guildId] || {}),
        logChannelId: channel.id
      };
      interaction.client.saveSettings?.(settings);

      const embed = new EmbedBuilder()
        .setTitle('📓 Log Channel Set')
        .setDescription(`Logs will now be sent to: ${channel}`)
        .setColor(0x2ecc71)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error('❌ setlogs failed:', err);

      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({
            content: '❌ Failed to set log channel.',
            flags: 64 // ephemeral
          });
        } catch (e) {
          console.error('❌ Could not reply at all:', e.message);
        }
      }
    }
  }
};
