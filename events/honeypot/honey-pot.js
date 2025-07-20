// create a channel honeypot
// if someone write on it, ban instantly the one that write on it
const { EmbedBuilder } = require('discord.js');

const channelHoneypot = '1396509303380381816';
const channelLog = '1396516358879055962';

/**
 *
 *  send a embeded message in the channel honeypot
 *
 */
const embedTheMessage = (message, channel) => {
  const channelHoneypot = message.guild.channels.cache.get(channel);

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('Honeypot Alert')
    .setDescription(`**User:** ${message.author.tag} (${message.author.id})\n**Message:** ${message.content}`)
    .setTimestamp();

  channelHoneypot.send({ embeds: [embed] });
};

/**
 *
 * send a embeded message in the channel log
 * we need this to track how sended the message this
 *
 */
const embedTheLog = (message, channel) => {
  const channelLog = message.guild.channels.cache.get(channel);

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('Honeypot Alert')
    .setDescription(`**User:** ${message.author.tag} (${message.author.id})\n**Message:** ${message.content}`)
    .setTimestamp();

  channelLog.send({ embeds: [embed] });
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

        // Banna l'utente
        // await message.member.ban({
        //   reason: 'Honeypot triggered - Suspected bot/malicious activity'
        // });

        // log debug
        console.log(`Banned user ${message.author.tag} (${message.author.id}) for writing in honeypot channel`);

        // send the message in the channel log
        embedTheLog(message, channelLog);

        // eliminiamo il messaggio,
        await message.delete();

        // clearriamo la chat honeypot
        const channelHoneypot = message.guild.channels.cache.get(channelHoneypot);
        console.log(channelHoneypot);
        // channelHoneypot.bulkDelete(5);

      } catch (error) {
        console.error('Error in honeypot ban:', error);
      }
    }
  },
};
