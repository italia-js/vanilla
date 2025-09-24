const { SlashCommandBuilder } = require('discord.js');
const aiShared = require('../../shared/ai-shared');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai-news-v2')
    .setDescription('Mostra le ultime notizie su AI e informatica'),


  async execute(interaction) {
    try {
      console.log('Generating commands for Vanilla...');
      await interaction.deferReply();

      // check if the API keys are present
      if (!process.env.NEWS_API_KEY) {
        console.error('NEWS_API_KEY not found in the .env file');
        await interaction.editReply('❌ Chiave NEWS API non configurata');
        return;
      }
      if (!process.env.MISTRAL_TOKEN) {
        console.error('MISTRAL_TOKEN not found in the .env file');
        await interaction.editReply('❌ Chiave Mistral API non configurata');
        return;
      }

      const result = await aiShared.processNewsArticle();

      if (!result) {
        await interaction.editReply('Nessuna notizia su AI e informatica trovata al momento.');
        return;
      }

      await interaction.editReply({
        content: result.comment,
        embeds: [result.embed]
      });

    } catch (error) {
      console.error('Errore nel comando AI:', error);
      await interaction.editReply('Errore nel recuperare le notizie. Riprova più tardi.');
    }
  }
};
