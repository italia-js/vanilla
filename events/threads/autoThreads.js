const { Events, ChannelType, MessageType, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const mistralService = require('../../shared/mistral-helper-threads');
const constants = require('../../config/constants');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (message.type !== MessageType.Default) return;
    if (message.channel.type !== ChannelType.GuildText) return;
    if (!message.channel.topic || !message.channel.topic.includes(constants.AUTOTHREADS_KEYWORD)) return;
    if (message.content.length < constants.AUTOTHREADS_MIN_MESSAGE_LENGTH) return;

    try {
      console.log(`AutoThreads: Processing message ${message.id} in channel ${message.channel.name}`);

      const title = await mistralService.generateTitle(message.content);
      console.log(`AutoThreads: Generated title: ${title}`);

      const thread = await message.startThread({
        name: title,
        autoArchiveDuration: constants.AUTOTHREADS_AUTO_ARCHIVE_DURATION,
        reason: 'AutoThreads: Automatic thread creation'
      });

      console.log(`AutoThreads: Created thread ${thread.id} with title: ${title}`);

      const editButton = new ButtonBuilder()
        .setCustomId(`edit_${message.author.id}_${thread.id}`)
        .setLabel('Edit title')
        .setStyle(ButtonStyle.Primary);

      const archiveButton = new ButtonBuilder()
        .setCustomId(`archive_${message.author.id}_${thread.id}`)
        .setLabel('Archive')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(editButton, archiveButton);

      await thread.send({
        content: `Thread created automatically! Original message by ${message.author}`,
        components: [row]
      });

    } catch (error) {
      console.error('AutoThreads error:', error);

      if (message.channel.permissionsFor(message.guild.members.me).has(['SendMessages'])) {
        await message.reply({
          content: '❌ Failed to create thread. Please check bot permissions.',
          allowedMentions: { repliedUser: false }
        }).catch(() => {});
      }
    }
  }
};
