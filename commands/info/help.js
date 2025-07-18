const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Restituisce la lista dei comandi disponibili'),

  async execute(interaction) {
    await interaction.reply('pls send help!!!');
  }
};
