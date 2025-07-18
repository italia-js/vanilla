const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggeststatus')
    .setDescription('Cambia lo stato ad un suggerimento')
    .addStringOption(option =>
      option.setName('messageid')
        .setDescription('ID del messaggio del suggerimento')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('stato')
        .setDescription('Nuovo stato del suggerimento')
        .setRequired(true)
        .addChoices(
          { name: 'Approvato', value: 'ok' },
          { name: 'Rifiutato', value: 'ko' }
        ))
    .addStringOption(option =>
      option.setName('motivazione')
        .setDescription('Motivazione (richiesta per il rifiuto)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.guild) {
      return await interaction.reply({
        content: 'Questo comando non è utilizzabile nei messaggi diretti',
        ephemeral: true
      });
    }

    const messageId = interaction.options.getString('messageid');
    const newStatus = interaction.options.getString('stato');
    const reason = interaction.options.getString('motivazione');

    let targetMessage;
    try {
      targetMessage = await interaction.channel.messages.fetch(messageId);
    } catch (error) {
      return await interaction.reply({
        content: 'Non riesco a trovare il messaggio. Assicurati di essere nel canale corretto e che l\'ID sia valido.',
        ephemeral: true
      });
    }

    if (!targetMessage.embeds.length) {
      return await interaction.reply({
        content: 'Il messaggio selezionato non è un suggerimento valido.',
        ephemeral: true
      });
    }

    const embedContent = targetMessage.embeds[0];
    let statusMessage = '';
    let statusColor = '';

    if (newStatus === 'ok') {
      statusColor = '#04c404';
      statusMessage = '✅ Stato: approvato (WIP)';
      await targetMessage.reactions.removeAll();
    } else if (newStatus === 'ko') {
      if (!reason) {
        return await interaction.reply({
          content: 'Devi specificare una motivazione quando rifiuti un suggerimento.',
          ephemeral: true
        });
      }
      statusColor = '#ff0000';
      statusMessage = `❌ Stato: rifiutato.\nMotivo: ${reason}`;
      await targetMessage.reactions.removeAll();
    }

    const embed = new EmbedBuilder()
      .setColor(statusColor)
      .setAuthor({
        name: embedContent.author.name,
        iconURL: embedContent.author.iconURL
      })
      .setDescription(embedContent.description)
      .setFooter({ text: statusMessage });

    await targetMessage.edit({ embeds: [embed] });

    await interaction.reply({
      content: 'Stato del suggerimento aggiornato!',
      ephemeral: true
    });
  }
};
