const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai-news-v2')
    .setDescription('Mostra le ultime notizie su AI e informatica'),


  async execute(interaction) {
    try {
      console.log('Generating commands for Vanilla...');
      await interaction.deferReply();

      // check if the API keys are present
      if (!process.env.NEWS_API_KEY) {
        console.error('NEWS_API_KEY not found in the .env file');
        await interaction.editReply('❌ Chiave NEWS API non configurata');
        return;
      }
      if (!process.env.MISTRAL_TOKEN) {
        console.error('MISTRAL_TOKEN not found in the .env file');
        await interaction.editReply('❌ Chiave Mistral API non configurata');
        return;
      }

      // load the behavior prompt
      const promptPath = path.join(__dirname, 'comportamento.md');
      let behaviorPrompt = '';
      try {
        behaviorPrompt = fs.readFileSync(promptPath, 'utf8');
      } catch (error) {
        // just in case
        console.error('Errore nel leggere comportamento.md:', error);
        behaviorPrompt = 'Commenta questa notizia in modo coinvolgente per stimolare discussione';
      }

      // randomize the type of news we want - only tech news
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

      const randomDiscussione = randomDiscussioneArray[Math.floor(Math.random() * randomDiscussioneArray.length)]; // randomize the type of news

      // tutorial taken in the doc hehe xd
      const url = new URL('https://newsapi.org/v2/everything');
      url.searchParams.append('q', randomDiscussione);
      url.searchParams.append('language', 'it');
      url.searchParams.append('sortBy', 'publishedAt');
      url.searchParams.append('pageSize', '20'); // take more articles to have variety
      url.searchParams.append('apiKey', process.env.NEWS_API_KEY);

      // console log need to test
      console.log('URL:', url.toString());
      console.log('Fetching URL:', url.toString());

      const response = await fetch(url.toString());

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // manage error
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.articles || data.articles.length === 0) {
        await interaction.editReply('Nessuna notizia su AI e informatica trovata al momento.');
        return;
      }

      // filter articles to exclude ads and non-tech content
      const validArticles = data.articles.filter(article =>
        article.author !== 'Pubblicità' &&
        article.author !== 'Pubblicita' &&
        article.author !== 'Advertisement' &&
        // exclude guide and tutorial
        !article.title?.toLowerCase().includes('novità da provare') &&
        !article.title?.toLowerCase().includes('come fare') &&
        !article.title?.toLowerCase().includes('guida') &&
        !article.title?.toLowerCase().includes('tutorial') &&
        !article.title?.toLowerCase().includes('recensione') &&
        // include only tech news
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
        await interaction.editReply('Nessuna notizia valida trovata (tutte erano pubblicità).');
        return;
      }

      // take a random article for AI analysis (among first 5)
      const randomIndex = Math.floor(Math.random() * Math.min(validArticles.length, 5));
      const selectedArticle = validArticles[randomIndex];

      // function to fetch the web content of the article
      async function fetchWebContent(url) {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          if (!response.ok) return null;

          const html = await response.text();
          // extract basic text by removing HTML tags
          const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          return textContent.substring(0, 3500); // limit to 3000 characters
        } catch (error) {
          console.error('Errore nel fetch del contenuto web:', error);
          return null;
        }
      }

      // function to call Mistral API
      async function generateAIComment(article, webContent) {
        try {
          // prendiamo behavior prompt e uniamo con la notizia
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
          return data.choices[0]?.message?.content || 'Cosa ne pensate di questa notizia? 🤔';
        } catch (error) {
          console.error('Errore nell\'API Mistral:', error);
          return 'Interessante sviluppo nel mondo tech! Cosa ne pensate? 🤔';
        }
      }

      // adjust web content
      const webContent = await fetchWebContent(selectedArticle.url);
      let aiComment = await generateAIComment(selectedArticle, webContent);

      // format code for discord
      aiComment = aiComment
        .replace(/\([^)]*\)/g, '')   // remove parentheses
        .replace(/["'"]/g, '')      // remove quotes
        .replace(/\?[^?]*$/g, '')   // remove questions at the end
        .replace(/\?/g, '')         // remove all question marks
        .replace(/\. /g, '.\n\n')   // new line after each dot
        .replace(/! /g, '!\n\n')    // new line after each exclamation
        .replace(/\n\n\n+/g, '\n\n') // remove multiple new lines
        .replace(/\s+/g, ' ')       // remove multiple spaces
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
        },
      };

      await interaction.editReply({
        content: `${aiComment}`,
        embeds: [embed]
      });

    } catch (error) {
      // gestiamo errore
      console.error('Errore nel comando AI:', error);
      await interaction.editReply('Errore nel recuperare le notizie. Riprova più tardi.');
    }
  }
};
