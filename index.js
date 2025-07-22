require('dotenv').config();
const path = require('path');
const fs = require('node:fs');
const { suggestionChannel } = require('./config.json');
const { Client, GatewayIntentBits, Partials, ActivityType, Collection } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();

// load events
const eventsPath = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(eventsPath);

for (const folder of eventFolders) {
  console.log(`Loading events from ${folder}`);
  const eventPath = path.join(eventsPath, folder);
  const eventFiles = fs.readdirSync(eventPath);

  for (const file of eventFiles) {
    console.log(`Loading event ${file}`);
    const filePath = path.join(eventPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

// load commands
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

client.once('ready', () => {
  console.log(`${client.user.username} has logged in`);

  client.user.setPresence({
    activities: [{
      name: 'without frameworks',
      type: ActivityType.Playing
    }],
    status: 'online'
  });
});

client.on('interactionCreate', async interaction => {

  const command = client.commands.get(interaction.commandName);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
  }
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
