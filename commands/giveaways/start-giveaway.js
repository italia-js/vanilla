const { MessageEmbed } = require('discord.js');
const Commando = require('discord.js-commando');
const { addMilliseconds, format } = require('date-fns')

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
  async run(message, args = 1) {
    if(isNaN(args)) {
      message.reply('Devi passare un numero come parametro es. `jsga 1`');
      return
    }
    const time = args * 60000;

    const endGiveaway = (msg) => {
      setTimeout(() => {
        const participants = [...msg.reactions.cache.first().users.cache.values()];
        const humans = participants.filter(participant => !participant.bot);

        if(humans.length) {
          const winner = humans[Math.floor(Math.random() * humans.length)].username;
          message.channel.send(`🎉 Il vincitore è ${winner} 🎉`);
        } else {
          message.channel.send(`❌ Non ci sono vincitori perché nessuno ha partecipato all'estrazione (o forse ho un bug 🤔)`);
        }

      }, time)
    }

    const embed = new MessageEmbed()
      .setColor('#ffe000')
      .setTitle('Jetbrains giveaway')
      .setURL('https://www.jetbrains.com/store/redeem/')
      .setThumbnail('https://upload.picpaste.me/images/2020/12/06/jetbrains.th.png')
      .setDescription(`**Free Personal Subscription \n100% DISCOUNT CODE** \n\nAppCode, CLion, DataGrip, GoLand, IntelliJ IDEA Ultimate, PhpStorm, PyCharm, ReSharper, ReSharper C++, Rider, RubyMine, WebStorm, o dotUltimate \n\n\n👇 clicca per partecipare all'estrazione. **(termina alle ${format(addMilliseconds(new Date(), time), 'kk:mm')})**`)

    const msg = await message.channel.send(embed);
    await msg.react('🎁');
    endGiveaway(msg);
  }
}
