const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { suggestionChannel } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Pubblica un\'idea o un suggerimento che può essere votato dagli utenti')
    .addStringOption(option =>
      option.setName('suggerimento')
        .setDescription('Il tuo suggerimento')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.guild) {
      return await interaction.reply({
        content: 'Questo comando non è utilizzabile nei messaggi diretti',
        ephemeral: true
      });
    }

    const targetChannel = interaction.guild.channels.cache.find(channel => channel.name === suggestionChannel);
    if (!targetChannel) {
      return await interaction.reply({
        content: 'Non riesco a trovare il canale per i suggerimenti',
        ephemeral: true
      });
    }

    if (interaction.channel.id !== targetChannel.id) {
      return await interaction.reply({
        content: `Questo comando è utilizzabile solo nel canale ${targetChannel}`,
        ephemeral: true
      });
    }

    const suggestion = interaction.options.getString('suggerimento');

    const embed = new EmbedBuilder()
      .setColor('#ffe000')
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setDescription(suggestion)
      .setFooter({ text: '💡 Stato: in valutazione' });

    const msg = await interaction.channel.send({ embeds: [embed] });
    await msg.react('👍');

    await interaction.reply({
      content: 'Suggerimento pubblicato!',
      ephemeral: true
    });
  }
};
