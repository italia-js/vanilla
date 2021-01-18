const { MessageEmbed } = require('discord.js');
const Commando = require('discord.js-commando');

module.exports = class SuggestionStatusCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'suggeststatus',
      group: 'voting',
      memberName: 'suggeststatus',
      aliases: ['plzstatus'],
      argsType: 'multiple',
      description: 'Cambia lo stato ad un suggerimento',
      userPermissions: ['ADMINISTRATOR']
    })
  }

  async run (message, args) {
    if(!args) return;

    if(message.channel.type === 'dm') {
      message.channel
        .send(`Questo comando non è utilizzabile nei messaggi diretti`);
        return
    }

    let statusMessage = '';
    let statusColor = '';
    const targetMessage = await message.channel.messages.fetch(args[0]);
    const embedContent = targetMessage.embeds[0];
    const reasonToReject = args.slice(2).join(' ');

    if(args[1] == 'ok') {
      statusColor = '#04c404';
      statusMessage = '✅ Stato: approvato (WIP)';
      targetMessage.reactions.removeAll();
    } else if (args[1] == 'ko') {
      statusColor = '#ff0000';
      statusMessage = `❌ Stato: rifiutato.\nMotivo: ${reasonToReject}`;
      targetMessage.reactions.removeAll();
    } else {
      const cmdError = await message.channel
        .send('Utilizzo: `jssuggeststatus <ID messaggio> <stato> <motivazione>`');
      await message.delete();
      return await cmdError.delete({timeout: 10000})
    }

    const embed = new MessageEmbed()
      .setColor(statusColor)
      .setAuthor(embedContent.author.name, embedContent.author.iconURL)
      .setDescription(embedContent.description)
      .setFooter(statusMessage)

    message.delete()

    targetMessage.edit(embed);
  }
}
