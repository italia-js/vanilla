const {
  extractArticleUrl,
  fetchArticleTitle,
  getCleanHostname,
  createTldrButton,
} = require('../../shared/tldr-shared');

const THREAD_NAME_MAX = 100;

async function buildThreadName(url) {
  const title = await fetchArticleTitle(url);
  const hostname = getCleanHostname(url);
  const base = title ? `${title} · ${hostname}` : `TLDR · ${hostname}`;
  if (base.length <= THREAD_NAME_MAX) return base;
  return base.slice(0, THREAD_NAME_MAX - 3).trimEnd() + '...';
}

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
      const thread = await message.startThread({
        name: await buildThreadName(url),
        autoArchiveDuration: 60,
      });

      await thread.send({
        content: 'Vuoi un TLDR di questo articolo?',
        components: [createTldrButton(message.id)],
      });
    } catch (error) {
      console.error('Errore nell\'offerta TLDR:', error);
    }
  },
};
