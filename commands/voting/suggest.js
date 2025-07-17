const { MessageEmbed } = require('discord.js');
const Commando = require('discord.js-commando');
const { suggestionChannel } = require('../../config.json');

module.exports = class SuggestCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'suggest',
      group: 'voting',
      memberName: 'suggest',
      aliases: ['plz'],
      description: 'Pubblica un messaggio con un\'idea o un suggerimento che può essere votato dagli utenti'
    });
  }

  async run (message, args) {

    if(message.channel.type === 'dm') {
      message.channel
        .send('Questo comando non è utilizzabile nei messaggi diretti');
      return;
    }

    if(message.channel.name !== suggestionChannel) {
      const channelId = message.guild.channels.cache.find(channel => channel.name === suggestionChannel);
      message.channel
        .send(`Questo comando è utilizzabile solo nel canale ${channelId}`);
      return;
    }

    if(!args) {
      const cmdError = await message.channel
        .send('Utilizzo: `jssuggest <il mio suggerimento>`');
      await message.delete();
      return await cmdError.delete({timeout: 10000});
    }
    const embed = new MessageEmbed()
      .setColor('#ffe000')
      .setAuthor(message.author.username, message.author.avatarURL())
      .setDescription(args)
      .setFooter('💡 Stato: in valutazione');

    message.delete();

    const msg = await message.channel.send(embed);
    await msg.react('👍');
  }
};
