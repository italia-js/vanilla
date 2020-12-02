module.exports = {
	name: 'info',
	description: 'Restituisce le informazioni su questo server',
	execute(message) {
		message.channel.send(`Nome: ${message.guild.name}\nMembri: ${message.guild.memberCount}`);
	},
};