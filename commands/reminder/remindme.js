const { MessageEmbed } = require('discord.js');
const Commando = require('discord.js-commando');

module.exports = class RemindeCommand extends Commando.Command {

  constructor(client) {
    super(client, {
      name: 'remindme',
      group: 'reminder',
      memberName: 'remindme',
      aliases: ['remindme'],
      argsType: 'multiple',
      description: 'Inserisci un reminder personale'
    })
  }

  async run(message, args) {
    
    if(message.channel.type !== 'dm') {
      await message.delete();
      message.author.send('Il comando jsremindme è utilizzabile solo nei messaggi diretti');
      return;
    }

    const remindWhen = args.pop();
    const remindWhat = args.join(" ");
    
    if(remindWhat.length === 0){
      message.reply(`L'input non è corretto! è necessario specificare un messaggio e l'unità temporale (es: compra il latte 30m)`);      
      return;
    }

    if(!this.isAllowedTimeInterval(remindWhen)){
      message.reply("L'input temporale non è corretto o assente! Dopo il messaggio, "+
      "utilizza un numero di massimo 3 cifre seguito da un unità di misura tra s, m, h e d (es: 600s, 10m, 1h, 1d)");
      return;
    }

    message.reply(`Reminder "${remindWhat}" impostato`);

    setTimeout(() => {
      const embed = new MessageEmbed()
        .setColor('#ffe000')
        .setTitle("🤖 Mi hai chiesto di ricordarti di questo messaggio: ")
        .setDescription(remindWhat)

      message.reply(embed);

    }, this.getMillisecondsFromTimeInterval(remindWhen))

  }

  /**
   * 
   * @param string remindWhen 
   * @returns bool 
   */
  isAllowedTimeInterval(remindWhen) {
    return remindWhen.match(/^[1-9]{1}[0-9]{0,2}[smhd]$/is);
  }
  
  /**
   * 
   * @param string remindWhen 
   * @returns number
   */
  getMillisecondsFromTimeInterval(remindWhen) {
    let seconds = 0;
    const measureUnit = remindWhen.slice(-1);
    const quantity = remindWhen.slice(0, -1);

    switch(measureUnit){
    case 'm': 
      seconds = quantity * 60;
      break;

    case 'h':
      seconds = quantity * 60 * 60;
      break;

    case 'd':
      seconds = quantity * 60 * 60 * 24;
      break;

    default:
      seconds = quantity * 1;
      break;
    }

    return seconds * 1000;
  }
}