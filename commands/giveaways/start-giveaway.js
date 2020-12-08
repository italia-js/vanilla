const { MessageEmbed } = require('discord.js');
const Commando = require('discord.js-commando');
const addMilliseconds = require('date-fns/addMilliseconds')

module.exports = class StartGiveawayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'giveaway',
      group: 'giveaways',
      memberName: 'giveaway',
      aliases: ['ga'],
      description: 'Fa partire l\'estrazione di un premio',
      userPermissions: ['ADMINISTRATOR']
    })
  }
  async run(message, args) {
    if(isNaN(args) || !args) {
      message.reply('Devi passare un numero come parametro es. `jsga 1`');
      return
    }
    message.delete();
    const time = args * 60000;
    const timezoneOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      timeZone: 'Europe/Rome'
    };
    const endingTime = new Intl.DateTimeFormat('it-IT', timezoneOptions)
      .format(addMilliseconds(new Date(), time));

    const endGiveaway = (msg) => {
      setTimeout(() => {
        const participants = [...msg.reactions.cache.first().users.cache.values()];
        const humans = participants.filter(participant => !participant.bot);

        if(humans.length) {
          const winnerId = humans[Math.floor(Math.random() * humans.length)].id;
          message.channel.send(`🎉 **Il vincitore del ${embedTitle} è <@${winnerId}>** 🎉`);
        } else {
          message.channel.send(`😕 **Non ci sono vincitori per il ${embedTitle} perché nessuno ha partecipato all'estrazione (o forse ho un bug 🤔)**`);
        }

        msg.edit(giveawayEnded);

      }, time)
    }

    const embedColor = '#ffe000';
    const embedTitle = 'Jetbrains giveaway';
    const embedURL = 'https://www.jetbrains.com/store/redeem/';
    const embedThumbnail = 'https://italiajs-media.firebaseapp.com/images/jetbrains.png';
    const embedDescription = `**Free Personal Subscription \n100% DISCOUNT CODE** \n\nAppCode, CLion, DataGrip, GoLand, IntelliJ IDEA Ultimate, PhpStorm, PyCharm, ReSharper, ReSharper C++, Rider, RubyMine, WebStorm, o dotUltimate \n\n\n`;
    const cta = `👇 clicca per partecipare all'estrazione. **(termina alle ${endingTime})**`;
    const ended = '**🛑 Il giveaway è terminato!** 🛑';

    const giveawayStarted = new MessageEmbed()
      .setColor(embedColor)
      .setTitle(embedTitle)
      .setURL(embedURL)
      .setThumbnail(embedThumbnail)
      .setDescription(embedDescription + cta);

    const giveawayEnded = new MessageEmbed()
      .setColor(embedColor)
      .setTitle(embedTitle)
      .setURL(embedURL)
      .setThumbnail(embedThumbnail)
      .setDescription(embedDescription + ended);

    const msg = await message.channel.send(giveawayStarted);
    await msg.react('🎁');
    endGiveaway(msg);
  }
}
