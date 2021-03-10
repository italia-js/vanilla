const { MessageEmbed } = require('discord.js');
const Commando = require('discord.js-commando');
const allowedMeasureUnits = ["minuti", "secondi", "ore", "giorni"];

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
        
        let [what, whenQuantity, whenMeasureUnit] = args; 
        
        let iWhenQuantity = parseInt(whenQuantity);
        
        if(Number.isNaN(iWhenQuantity)){
            message.reply(`L'input temporale non è corretto! utilizza un numero seguito da un unità di misura (es: 10 minuti, 30 secondi)`);      
            return;
        }

        if(allowedMeasureUnits.indexOf(whenMeasureUnit) === -1){
            message.reply(`L'unità di misura temporale non è corretta! utilizza un'unità misura tra le seguenti: ${allowedMeasureUnits.join(", ")} (es: 10 minuti, 30 secondi)`);      
            return;
        }

        message.reply(`Reminder "${what}" impostato`);

        setTimeout(() => {

            const embed = new MessageEmbed()
                .setColor('#ffe000')
                .setTitle("🤖 Mi hai chiesto di ricordarti di questo messaggio: ")
                .setDescription(what)

            message.reply(embed);

        }, this.#getMillisecondsFromSelectedDelay(iWhenQuantity, whenMeasureUnit))

    }

    #getMillisecondsFromSelectedDelay(quantity, measureUnit){
        let seconds = 0;
        switch(measureUnit){
            case 'minuti': 
                seconds = quantity * 60;
            break;

            case 'ore':
                seconds = quantity * 60 * 60;
            break;

            case 'giorni':
                seconds = quantity * 60 * 60 * 24;
            break;

            default:
                seconds = quantity * 1;
            break;
        }

        return seconds * 1000;
    }
}