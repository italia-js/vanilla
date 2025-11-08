const { SlashCommandBuilder, ChannelType } = require('discord.js');
const mistralHelper = require('../../shared/mistral-helper-threads');
const constants = require('../../config/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('divine-light-this')
    .setDescription('Sposta un messaggio in un forum post con titolo generato automaticamente')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('ID del messaggio da spostare nel forum')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('forum_channel')
        .setDescription('Canale forum dove creare il post')
        .addChannelTypes(ChannelType.GuildForum)
        .setRequired(true)),

  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');
    const forumChannel = interaction.options.getChannel('forum_channel');

    try {
      if (forumChannel.type !== ChannelType.GuildForum) {
        await interaction.reply({
          content: 'Il canale selezionato non è un forum!',
          flags: 64
        });
        return;
      }

      const targetMessage = await interaction.channel.messages.fetch(messageId);

      const threadTitle = await mistralHelper.generateTitle(targetMessage.content);

      const forumPost = await forumChannel.threads.create({
        name: threadTitle,
        message: {
          content: `**Messaggio spostato da ${targetMessage.author.toString()} da ${interaction.channel.toString()}:**\n**Link originale:** ${targetMessage.url}\n\n${targetMessage.content}`,
          allowedMentions: { parse: [] }
        },
        autoArchiveDuration: constants.AUTOTHREADS_AUTO_ARCHIVE_DURATION,
        reason: `Messaggio spostato via /divine-light-this da ${interaction.user.tag}`
      });

      await interaction.reply({
        content: `Messaggio spostato con successo nel forum!\n**Titolo:** "${threadTitle}"\n**Post:** ${forumPost.url}`,
        flags: 64
      });

      // Opzionalm
      // await targetMessage.delete();

    } catch (error) {
      console.error('Divine light error:', error);

      let errorMessage = 'Errore nello spostamento del messaggio.';

      if (error.code === 10008) {
        errorMessage = 'Messaggio non trovato. Verifica che l\'ID sia corretto.';
      } else if (error.code === 50013) {
        errorMessage = 'Permessi insufficienti per creare post nel forum.';
      } else if (error.code === 50035) {
        errorMessage = 'Dati non validi per la creazione del post.';
      }

      await interaction.reply({
        content: errorMessage,
        flags: 64
      });
    }
  }
};
