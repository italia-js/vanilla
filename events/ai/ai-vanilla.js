const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`AI News Bot attivo come ${client.user.tag}`);

    const CHANNEL_NAME = '782921551225028624';
    const INTERVAL_MINUTES = 300; // 300 is 5 hours

    // for testing use this below is from my server
    // const CHANNEL_NAME = '1395516330563735625';
    // const INTERVAL_MINUTES = 0.1; // 0.1 is 10 sec

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
    const promptPath = path.join(__dirname, '../../commands/ai/comportamento.md');
    let behaviorPrompt = '';
    try {
      behaviorPrompt = fs.readFileSync(promptPath, 'utf8');
    } catch (error) {
      console.error('Errore nel leggere comportamento.md:', error);
      behaviorPrompt = 'Commenta questa notizia in modo coinvolgente per stimolare discussione';
    }

    const randomDiscussioneArray = [
      'cybersecurity',
      'data breach',
      'AI intelligenza artificiale',
      'tech startup',
      'software sviluppo',
      'privacy dati',
      'cloud computing',
      'internet tecnologia'
    ];

    const randomDiscussione = randomDiscussioneArray[Math.floor(Math.random() * randomDiscussioneArray.length)];

    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.append('q', randomDiscussione);
    url.searchParams.append('language', 'it');
    url.searchParams.append('sortBy', 'publishedAt');
    url.searchParams.append('pageSize', '20');
    url.searchParams.append('apiKey', process.env.NEWS_API_KEY);

    console.log('Fetching URL:', url.toString());
    const response = await fetch(url.toString());
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.articles || data.articles.length === 0) {
      console.log('Nessuna notizia trovata');
      return;
    }

    const validArticles = data.articles.filter(article =>
      article.author !== 'Pubblicit�' &&
      article.author !== 'Pubblicita' &&
      article.author !== 'Advertisement' &&
      !article.title?.toLowerCase().includes('novit� da provare') &&
      !article.title?.toLowerCase().includes('come fare') &&
      !article.title?.toLowerCase().includes('guida') &&
      !article.title?.toLowerCase().includes('tutorial') &&
      !article.title?.toLowerCase().includes('recensione') &&
      (article.title?.toLowerCase().includes('startup') ||
       article.title?.toLowerCase().includes('azienda') ||
       article.title?.toLowerCase().includes('sicurezza') ||
       article.title?.toLowerCase().includes('privacy') ||
       article.title?.toLowerCase().includes('hack') ||
       article.title?.toLowerCase().includes('data') ||
       article.title?.toLowerCase().includes('cloud') ||
       article.title?.toLowerCase().includes('ai') ||
       article.title?.toLowerCase().includes('tech') ||
       article.description?.toLowerCase().includes('azienda') ||
       article.description?.toLowerCase().includes('startup'))
    );

    if (validArticles.length === 0) {
      console.log('Nessuna notizia valida trovata');
      return;
    }

    const randomIndex = Math.floor(Math.random() * Math.min(validArticles.length, 5));
    const selectedArticle = validArticles[randomIndex];

    const webContent = await fetchWebContent(selectedArticle.url);
    const aiComment = await generateAIComment(selectedArticle, webContent, behaviorPrompt);

    let formattedComment = aiComment
      .replace(/\([^)]*\)/g, '')
      .replace(/["'"]/g, '')
      .replace(/\?[^?]*$/g, '')
      .replace(/\?/g, '')
      .replace(/\. /g, '.\n\n')
      .replace(/! /g, '!\n\n')
      .replace(/\n\n\n+/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim();

    const embed = {
      title: selectedArticle.title || 'Nessun titolo',
      description: selectedArticle.description ?
        (selectedArticle.description.length > 200 ?
          selectedArticle.description.substring(0, 200) + '...' :
          selectedArticle.description) :
        'Nessuna descrizione disponibile',
      url: selectedArticle.url || '',
      color: 0x2b2d31,
      footer: {
        text: `Pubblicato: ${new Date(selectedArticle.publishedAt).toLocaleDateString('it-IT')} • Fonte: ${selectedArticle.source?.name || 'Sconosciuta'}`
      }
    };

    await channel.send({
      content: formattedComment,
      embeds: [embed]
    });

    console.log(`Notizia inviata nel canale ${channel.name}`);

  } catch (error) {
    console.error('Errore nell\'invio della notizia:', error);
  }
}

async function fetchWebContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (!response.ok) return null;

    const html = await response.text();
    const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return textContent.substring(0, 3500);
  } catch (error) {
    console.error('Errore nel fetch del contenuto web:', error);
    return null;
  }
}

async function generateAIComment(article, webContent, behaviorPrompt) {
  try {
    const mistralPrompt = `${behaviorPrompt}

NOTIZIA:
Titolo: ${article.title}
Descrizione: ${article.description}
${webContent ? `Contenuto articolo: ${webContent}` : ''}

Genera SOLO un commento diretto e conciso (1-2 righe massimo) come se FOSSI COINVOLTO personalmente. Usa "io", "mi", "a me" per essere personale. NON FARE DOMANDE. Racconta come ti impatta. USA GRAMMATICA ITALIANA CORRETTA SEMPRE.`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: mistralPrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Interessante sviluppo nel mondo tech!';
  } catch (error) {
    console.error('Errore nell\'API Mistral:', error);
    return 'Interessante sviluppo nel mondo tech!';
  }
}
