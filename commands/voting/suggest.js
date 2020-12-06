const { MessageEmbed } = require('discord.js');
const Commando = require('discord.js-commando');

module.exports = class SuggestionsCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'suggest',
      group: 'voting',
      memberName: 'suggest',
      aliases: ['plz'],
      description: 'Crea un suggerimento che può essere votato dagli utenti'
    })
  }

  async run (message, args) {
    if(!args) {
      const cmdError = await message.channel
        .send('Utilizzo: `jssuggest il mio suggerimento`');
      await message.delete();
      return await cmdError.delete({timeout: 10000})
    }
    const embed = new MessageEmbed()
      .setColor('#ffe000')
      .setAuthor(message.author.username, message.author.avatarURL())
      .setDescription(args)

    message.delete()
      .catch(console.error);

    const msg = await message.channel.send(embed);
    await msg.react('👍')
  }
}
