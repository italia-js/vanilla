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
  async run(message) {
    message.channel.send(`Nome: ${message.guild.name}\nMembri: ${message.guild.memberCount}`);
  }
}
