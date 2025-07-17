require('dotenv').config();
const path = require('path');
const { prefix, suggestionChannel } = require('./config.json');
const Commando = require('discord.js-commando');

const client = new Commando.CommandoClient({
  owner: process.env.OWNER_ID,
  commandPrefix: prefix
});

client.once('ready', () => {
  console.log(`${client.user.username} has logged in`);

  client.user.setPresence({
    activity: {
      name: 'without frameworks'
    },
    status: 'online'
  });

  client.registry
    .registerGroups([
      ['info', 'commands providing informations'],
      ['giveaways', 'commands providing giveaway functions'],
      ['voting', 'commands for polls, starboards etc']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'));
});

client.on('message', (message) => {
  if(message.mentions.users.first() && message.mentions.users.first().username === 'Vanilla') {
    message.reply('Il prefisso per i comandi è `js`. Prova `jshelp` 😉');
  }

  if (message.channel.name == suggestionChannel && !message.author.bot) {
    if (!(message.content.startsWith('jssuggest') || message.content.startsWith('jsplz'))) {
      message.delete();
    }
  }
});

client.on('error', console.error);

client.login(process.env.VANILLA_BOT_TOKEN);
