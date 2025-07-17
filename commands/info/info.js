const { MessageEmbed } = require('discord.js');
const Commando = require('discord.js-commando');

module.exports = class InfoCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'info',
      group: 'info',
      memberName: 'info',
      description: 'Restituisce delle informazioni su questo bot'
    });
  }

  async run (message) {
    const embed = new MessageEmbed()
      .setColor('#ffe000')
      .setTitle('🤖 Vanilla - il bot di Italia JS')
      .setDescription(`Vanilla è un bot nato con l'idea di essere sviluppato dai membri della community ed è stato creato in node con [Discord.js](https://discord.js.org).

      Essendo [open source](https://github.com/italia-js/vanilla) ognuno può proporre e implementare nuove feature o migliorare quelle esistenti.
      Tuttavia, se ti interessa essere coinvolto maggiormente, chiedi a <@458989281126645771> di essere ammesso nel team. Riceverai un ruolo e colore utente speciale, l'accesso al canale privato #vanilla-dev e la gratitudine eterna della community.

      Sviluppare comandi per Vanilla è divertente e può essere un modo per avvicinarsi all'open source.

      Aspetto i tuoi contributi! 🦾
      `);

    message.channel.send(embed);
    console.log();
  }
};
