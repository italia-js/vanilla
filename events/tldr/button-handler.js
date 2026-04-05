const { fetchWebContent } = require('../../shared/ai-shared');
const {
  extractArticleUrl,
  generateTldr,
  createTldrEmbed,
  checkTldrCooldown,
  markTldrCooldown,
} = require('../../shared/tldr-shared');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('tldr:')) return;

    const messageId = interaction.customId.split(':')[1];

    if (!checkTldrCooldown(messageId)) {
      await interaction.reply({
        content: 'TLDR già generato di recente per questo articolo.',
        ephemeral: true,
      });
      return;
    }

    markTldrCooldown(messageId);
    await interaction.deferReply();

    try {
      const originalMessage = await interaction.channel.messages.fetch(messageId);
      const url = extractArticleUrl(originalMessage.content);

      if (!url) {
        await interaction.editReply('Non riesco a trovare un URL valido in questo messaggio.');
        return;
      }

      const webContent = await fetchWebContent(url);
      if (!webContent) {
        await interaction.editReply('Non riesco ad accedere al contenuto dell\'articolo.');
        return;
      }

      const tldrText = await generateTldr(url, webContent);
      await interaction.editReply({ embeds: [createTldrEmbed(url, tldrText)] });
      await interaction.message.edit({ components: [] });
    } catch (error) {
      console.error('Errore nel button handler TLDR:', error);
      await interaction.editReply('Errore durante la generazione del TLDR.').catch(() => {});
    }
  },
};
