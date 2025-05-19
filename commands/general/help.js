const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ComponentType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show information about Valqq Bot features'),

  async execute(interaction) {
    const helpEmbed = new EmbedBuilder()
      .setTitle('🛠️ Valqq Bot Help Menu')
      .setDescription('Choose a category below to get help with that feature.')
      .setColor(0x6a0dad)
      .setFooter({ text: 'Valqq Bot • Blade Ball Clan Utilities' });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_select')
      .setPlaceholder('Choose a feature...')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Moderation')
          .setDescription('Ban, kick, mute, warn...')
          .setValue('moderation'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Reminders')
          .setDescription('Clan war and weekly pings')
          .setValue('reminders'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Logging')
          .setDescription('Deleted/edited message logging')
          .setValue('logs'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Embed Tool')
          .setDescription('Send custom embeds')
          .setValue('embed'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Automod')
          .setDescription('Auto-delete bad words')
          .setValue('automod'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Welcome System')
          .setDescription('Greet new users with custom embed')
          .setValue('welcome'),
        new StringSelectMenuOptionBuilder()
          .setLabel('❌ Close')
          .setDescription('Close the help menu')
          .setValue('cancel')
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      embeds: [helpEmbed],
      components: [row],
      ephemeral: true
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
      filter: i => i.user.id === interaction.user.id
    });

    collector.on('collect', async i => {
      const selection = i.values[0];
      if (selection === 'cancel') {
        await i.update({
          content: '❌ Help menu closed.',
          embeds: [],
          components: []
        });
        collector.stop();
        return;
      }

      const embed = new EmbedBuilder().setColor('Blurple');

      switch (selection) {
        case 'moderation':
          embed.setTitle('Moderation Commands')
            .setDescription('Use these commands to manage users in your server:')
            .addFields(
              { name: 'Actions', value: '`/ban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/timeout`, `/untimeout`' },
              { name: 'Messages', value: '`/purge`, `/delete`' }
            );
          break;
        case 'reminders':
          embed.setTitle('Reminder System')
            .setDescription('Stay on top of clan wars and weekly events.')
            .addFields(
              { name: 'One-Time', value: '`/remind` — ping users once at a set time.' },
              { name: 'Weekly', value: '`/remindweekly` — schedule repeat pings for clan events.' }
            );
          break;
        case 'logs':
          embed.setTitle('Logging System')
            .setDescription('Log important server events.')
            .addFields({
              name: 'Setup',
              value: '`/setlogs` — choose a channel to log:\n• Deleted messages\n• Edits\n• Joins/Leaves\n• Moderation actions'
            });
          break;
        case 'embed':
          embed.setTitle('Embed Tool')
            .setDescription('Send stylish embedded messages.')
            .addFields({
              name: 'Usage',
              value: '`/embed` — build and send embeds with custom title, description, and channel.'
            });
          break;
        case 'automod':
          embed.setTitle('Automod System')
            .setDescription('Automatically delete and log messages with banned words.')
            .addFields(
              { name: 'Add', value: '`/badwords add word:<word>`' },
              { name: 'View', value: '`/badwords list`' }
            );
          break;
        case 'welcome':
          embed.setTitle('Welcome System')
            .setDescription('Send automatic welcome embeds to new members.')
            .addFields(
              { name: 'Setup', value: '`/configwelcome` — set welcome channel and message using `{user}`' },
              { name: 'Preview', value: '`/previewwelcome` — see a preview of your welcome embed' }
            );
          break;
      }

      await i.update({
        embeds: [embed],
        components: [row]
      });
    });
  }
};
