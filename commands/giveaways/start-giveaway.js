const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addMilliseconds } = require('date-fns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Fa partire l\'estrazione di un premio')
    .addIntegerOption(option =>
      option.setName('minuti')
        .setDescription('Durata del giveaway in minuti')
        .setRequired(true)
        .setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const minutes = interaction.options.getInteger('minuti');
    const time = minutes * 60000;

    const timezoneOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      timeZone: 'Europe/Rome'
    };

    const endingTime = new Intl.DateTimeFormat('it-IT', timezoneOptions)
      .format(addMilliseconds(new Date(), time));

    const embedColor = '#ffe000';
    const embedTitle = 'Jetbrains giveaway';
    const embedURL = 'https://www.jetbrains.com/store/redeem/';
    const embedThumbnail = 'https://italiajs-media.firebaseapp.com/images/jetbrains.png';
    const embedDescription = '**Free Personal Subscription \n100% DISCOUNT CODE** \n\nAppCode, CLion, DataGrip, GoLand, IntelliJ IDEA Ultimate, PhpStorm, PyCharm, ReSharper, ReSharper C++, Rider, RubyMine, WebStorm, o dotUltimate \n\n\n';
    const cta = `👇 clicca per partecipare all'estrazione. **(termina alle ${endingTime})**`;
    const ended = '**🛑 Il giveaway è terminato!** 🛑';

    const giveawayStarted = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(embedTitle)
      .setURL(embedURL)
      .setThumbnail(embedThumbnail)
      .setDescription(embedDescription + cta);

    const giveawayEnded = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(embedTitle)
      .setURL(embedURL)
      .setThumbnail(embedThumbnail)
      .setDescription(embedDescription + ended);

    await interaction.deferReply();

    const msg = await interaction.channel.send({ embeds: [giveawayStarted] });
    await msg.react('🎁');

    await interaction.editReply(`Giveaway avviato! Durata: ${minutes} minuti`);

    setTimeout(async () => {
      const fetchedMsg = await msg.fetch();
      const reaction = fetchedMsg.reactions.cache.get('🎁');

      const users = await reaction.users.fetch();
      const participants = users.filter(user => !user.bot);

      if (participants.size > 0) {
        const winner = participants.random();
        await interaction.channel.send(`🎉 **Il vincitore del ${embedTitle} è <@${winner.id}>** 🎉`);
      } else {
        await interaction.channel.send(`😕 **Non ci sono vincitori per il ${embedTitle} perché nessuno ha partecipato all'estrazione (o forse ho un bug 🤔)**`);
      }

      await msg.edit({ embeds: [giveawayEnded] });
    }, time);
  }
};
