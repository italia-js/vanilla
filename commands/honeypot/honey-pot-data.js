const { SlashCommandBuilder, PermissionFlagsBits, Client, GatewayIntentBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('honeypot')
    .setDescription('comandi per vedere i dati del honeypot, mostrera, una lista di bannati per il honeypot')
    .addSubcommand(subcommand =>
      subcommand.setName('bannati')
        .setDescription('mostra una lista di bannati per il honeypot')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),


  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'bannati') {

      const guild = interaction.guild;

      try {

        const bannati = await guild.bans.fetch();
        const filteredBannati = bannati.filter(member => member.reason === 'Honeypot triggered - Suspected bot/malicious activity');

        // TODO: to format with embed
        const bannatiList = filteredBannati.map(member => member.user.tag).join('\n');
        await interaction.reply(`Lista dei bannati per il honeypot:\n${bannatiList}`);

        const channelLog = interaction.guild.channels.cache.get('1396529523058802838');
        channelLog.send(`Lista dei bannati per il honeypot:\n${bannatiList}, id: ${interaction.guild.id}, timestamp: ${new Date().toISOString()}`);

      } catch (error) {
        console.error('Error fetching banned members:', error);
      }
    }
  }
};
