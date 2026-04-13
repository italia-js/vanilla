const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const mistralHelper = require('../../shared/mistral-helper-threads');
const constants = require('../../config/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('thread-this')
    .setDescription('Crea un thread dal messaggio specificato')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('ID del messaggio per cui creare il thread')
        .setRequired(true)),

  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');

    try {
      const targetMessage = await interaction.channel.messages.fetch(messageId);

      const threadTitle = await mistralHelper.generateTitle(targetMessage.content);

      await targetMessage.startThread({
        name: threadTitle,
        autoArchiveDuration: constants.AUTOTHREADS_AUTO_ARCHIVE_DURATION,
        reason: 'Thread created via /thread-this command'
      });

      await interaction.reply({
        content: `Thread creato con successo!\nTitolo: "${threadTitle}"`,
        flags: 64
      });
    } catch (error) {
      console.error('Thread creation error:', error);

      let errorMessage = 'Errore nella creazione del thread.';

      if (error.code === 10008) {
        errorMessage = 'Messaggio non trovato. Verifica che l\'ID sia corretto.';
      } else if (error.code === 50013) {
        errorMessage = 'Permessi insufficienti per creare thread.';
      } else if (error.code === 160004) {
        errorMessage = 'Impossibile creare thread su questo tipo di messaggio.';
      }

      await interaction.reply({
        content: errorMessage,
        flags: 64
      });
    }
  }
};
