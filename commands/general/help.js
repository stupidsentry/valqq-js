const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show information about Valqq Bot features'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🛠️ Valqq Bot Help Menu')
      .setDescription('Select a feature below to learn more:')
      .setColor(0x6a0dad)
      .setFooter({ text: 'Valqq Bot • Blade Ball Clan Utilities' });

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('embed').setLabel('Embed Message').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('moderation').setLabel('Moderation').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('reminders').setLabel('Reminders').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('logs').setLabel('Logging').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('automod').setLabel('Automod').setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('cancel').setLabel('Close').setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
      filter: i => i.user.id === interaction.user.id
    });

    collector.on('collect', async i => {
  let response = '';
  switch (i.customId) {
    case 'moderation':
      response = '**Moderation Commands:**\n• `/ban` `/kick` `/mute` `/unmute` `/warn` `/timeout` `/untimeout`\n• `/purge` `/delete`';
      break;
    case 'reminders':
      response = '**Reminders:**\nUse `/remind` for one-time alerts, or `/remindweekly` for weekly schedules.\nSupports timezone handling and up to 5 user pings.';
      break;
    case 'logs':
      response = '**Log Configuration:**\nUse `/setlogs` to choose a channel where deleted, edited, and moderation events will be recorded.';
      break;
    case 'embed':
      response = '**Embed Tool:**\nUse `/embed` to send styled embedded messages into any channel. Includes support for title, description, and optional channel.';
      break;
    case 'automod':
      response = '**Automod System:**\n• `/badwords add word:<word>` to block specific words\n• `/badwords list` to view them\n• Messages with these words are auto-deleted and logged.';
      break;
    case 'cancel':
      await i.deferUpdate();
      await interaction.editReply({ content: '❌ Help menu closed.', embeds: [], components: [] });
      collector.stop();
      return;
  }

 await i.deferUpdate(); // Acknowledge the interaction to prevent it from expiring

// Then follow up by editing the original reply
await interaction.editReply({
  content: response,
  embeds: [],
  components: [],
});

  })

  }};