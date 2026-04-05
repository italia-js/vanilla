const { SlashCommandBuilder } = require('discord.js');
const { fetchWebContent } = require('../../shared/ai-shared');
const { isArticleUrl, generateTldr, createTldrEmbed } = require('../../shared/tldr-shared');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tldr')
    .setDescription('Genera un TLDR di un articolo')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription("URL dell'articolo da riassumere")
        .setRequired(true)
    ),

  async execute(interaction) {
    const url = interaction.options.getString('url');

    if (!isArticleUrl(url)) {
      await interaction.reply({
        content: 'L\'URL non sembra un articolo valido. Prova con un link diretto a un post o una news.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    const webContent = await fetchWebContent(url);
    if (!webContent) {
      await interaction.editReply('Non riesco ad accedere al contenuto dell\'articolo.');
      return;
    }

    const tldrText = await generateTldr(url, webContent);
    await interaction.editReply({ embeds: [createTldrEmbed(url, tldrText)] });
  },
};
