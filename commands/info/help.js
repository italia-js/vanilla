const Commando = require('discord.js-commando');

module.exports = class HelpCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'help',
      group: 'info',
      memberName: 'help',
      description: 'Restituisce la lista dei comandi disponibili'
    });
  }
  async run(message) {
    message.channel.send('pls send help!!!');
    message.react('😱');
  }
};
