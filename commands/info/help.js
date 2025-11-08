const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Restituisce la lista dei comandi disponibili'),

  async execute(interaction) {
    let description = '';
    for (const command of interaction.client.commands.values()) {
      description += `**${command.data.name}**: ${command.data.description}\n`;
    }

    const embeddedBuilder = new EmbedBuilder()
      .setColor('#ffe000')
      .setTitle('Comandi disponibili')
      .setDescription(description);

    await interaction.reply({ embeds: [embeddedBuilder] });
  }
};
