const { MessageEmbed } = require('discord.js');
const Commando = require('discord.js-commando');

module.exports = class InfoCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'info',
      group: 'info',
      memberName: 'info',
      description: 'Restituisce delle informazioni sul server'
    })
  }

  async run (message) {
    const embed = new MessageEmbed()
      .setColor('#ffe000')
      .setTitle(message.guild.name)
      .addFields(
        {name: 'Totale membri:', value: message.guild.memberCount}
      )

    message.channel.send(embed);
  }
}
