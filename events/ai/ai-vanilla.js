const config = require('../../config/constants');
const aiShared = require('../../shared/ai-shared');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`AI News Bot attivo come ${client.user.tag}`);

    if (!config.AI_BOT_ENABLED) {
      console.log('AI Bot feature is disabled. Set AI_BOT_ENABLED=true to enable.');
      return;
    }

    // for production use this below is from
    const CHANNEL_NAME = config.CHANNEL_NAME ;
    const INTERVAL_MINUTES = config.INTERVAL_MINUTES;

    // for testing use this below is from my server
    // const CHANNEL_NAME = config.CHANNEL_NAME_TEST;
    // const INTERVAL_MINUTES = config.INTERVAL_MINUTES_TEST;

    setInterval(async () => {
      try {
        const channel = client.channels.cache.find(ch => ch.id === CHANNEL_NAME);
        if (!channel) {
          console.error(`Canale "${CHANNEL_NAME}" non trovato`);
          return;
        }

        await sendNewsToChannel(channel);

      } catch (error) {
        console.error('Errore nell\'invio automatico delle notizie:', error);
      }
    }, INTERVAL_MINUTES * 60 * 1000);
  }
};

async function sendNewsToChannel(channel) {
  try {
    const result = await aiShared.processNewsArticle();

    if (!result) {
      console.log('Nessuna notizia trovata o valida');
      return;
    }

    await channel.send({
      content: result.comment,
      embeds: [result.embed]
    });

    console.log(`Notizia inviata nel canale ${channel.name}`);

  } catch (error) {
    console.error('Errore nell\'invio della notizia:', error);
  }
}
