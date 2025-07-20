// create a channel honeypot
// if someone write on it, ban instantly the one that write on it
const { EmbedBuilder } = require('discord.js');

const channelHoneypot = '1396509303380381816';
const channelLog = '1396516358879055962';

// add emoticon for kill streak, and other things, to refactor because
// it just delete the infomessagehoneypot
const infoHoneypot = (message, channel, bannedNumber) => {
  const channelMessage = message.client.channels.cache.get(channel);

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('⚠️ Honeypot Alert - Info ⚠️')
    .setDescription(`Benvenuti nel canale Honeypot! Questo canale è progettato per rilevare e gestire attività sospette. Se qualcuno invia un messaggio qui, verrà automaticamente bannato. Si prega di non inviare messaggi in questo canale a meno che non si desideri essere bannati. \nkillstreak: ${bannedNumber}`)
    .setTimestamp();

  channelMessage.send({ embeds: [embed] });
};

/**
 *
 *  send a embeded message in the channel honeypot
 *
 */
const embedTheMessage = (message, channel) => {
  const channelMessage = message.guild.channels.cache.get(channel);

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('Honeypot Alert')
    .setDescription(`**User:** ${message.author.tag} (${message.author.id})\n**Message:** ${message.content}`)
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  channelMessage.send({ embeds: [embed] });
};

/**
 *
 * send a embeded message in the channel log
 * we need this to track how sended the message this
 *
 */
const embedTheLog = (message, channel) => {
  const channelMessage = message.guild.channels.cache.get(channel);

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('Honeypot Alert - Log')
    .setDescription(`**User:** ${message.author.tag} (${message.author.id})\n**Message:** ${message.content}`)
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  channelMessage.send({ embeds: [embed] });
};


module.exports = {
  name: 'messageCreate',
  async execute(message) {


    if (message.channel.id === channelHoneypot) {

      // this perche' se il messaggio e' del bot, non faccio nulla
      if (message.author.bot) return;

      try {


        // send the message in the channel honeypot
        embedTheMessage(message, channelHoneypot);

        // banna l'utente e assegna il ruolo
        // await message.member.ban({
        //   reason: 'Honeypot triggered - Suspected bot/malicious activity'
        // });

        // send the message in the channel log
        embedTheLog(message, channelLog);

        // delete the message
        await message.delete();

        // fetch bannati
        const guild = message.guild;
        const bannati = await guild.bans.fetch();
        const bannedNumber = bannati.size;

        // clear recent messages and show info
        const honeypotChannel = message.guild.channels.cache.get(channelHoneypot);

        await honeypotChannel.bulkDelete(10).then(() => {
          infoHoneypot(message, channelHoneypot, bannedNumber);
        });

      } catch (error) {
        console.error('Error in honeypot ban:', error);
      }
    }
  },
};
