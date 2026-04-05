const {
  extractArticleUrl,
  createTldrButton,
} = require('../../shared/tldr-shared');

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    if (message.author.bot) return;
    if (message.partial) await message.fetch();
    if (message.mentions.has(client.user)) return;

    const url = extractArticleUrl(message.content);
    if (!url) return;

    try {
      await message.reply({
        content: 'Vuoi un TLDR di questo articolo?',
        components: [createTldrButton(message.id)],
        failIfNotExists: false,
      });
    } catch (error) {
      console.error('Errore nell\'offerta TLDR:', error);
    }
  },
};
