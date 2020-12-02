const { prefix } = require('../config.json');

module.exports = {
  name: 'help',
  description: 'Elenca i comandi disponbili',
  usage: `${prefix}help`,
  cooldown: '5',
  execute(message) {
    message.channel.send('pls send help!!!');
    message.react('😱');
  },
};