const fs = require('fs');
const path = require('path');
const config = require('../config/constants');

const randomDiscussions = [
  'cybersecurity',
  'data breach',
  'AI artificial intelligence',
  'tech startup',
  'software development',
  'data privacy',
  'cloud computing',
  'internet technology'
];

function loadBehaviorPrompt() {
  const promptPath = path.join(__dirname, '../commands/ai/comportamento.md');
  try {
    return fs.readFileSync(promptPath, 'utf8');
  } catch (error) {
    console.error('Errore nel leggere comportamento.md:', error);
    return 'Commenta questa notizia in modo coinvolgente per stimolare discussione';
  }
}

function getRandomDiscussionTopic() {
  return randomDiscussions[Math.floor(Math.random() * randomDiscussions.length)];
}

function buildNewsApiUrl(query) {
  const url = new URL(config.NEWS_API_BASE_URL);
  url.searchParams.append('q', query);
  url.searchParams.append('language', config.NEWS_API_LANGUAGE);
  url.searchParams.append('sortBy', config.NEWS_API_SORT_BY);
  url.searchParams.append('pageSize', config.NEWS_API_PAGE_SIZE);
  url.searchParams.append('apiKey', process.env.NEWS_API_KEY);
  return url;
}

const filterAds = (article) =>
  article.author !== 'Pubblicità' &&
  article.author !== 'Advertisement';

const filterGuides = (article) =>
  !article.title?.toLowerCase().includes('novità da provare') &&
  !article.title?.toLowerCase().includes('come fare') &&
  !article.title?.toLowerCase().includes('guida') &&
  !article.title?.toLowerCase().includes('tutorial') &&
  !article.title?.toLowerCase().includes('recensione');

const filterTechContent = (article) =>
  article.title?.toLowerCase().includes('startup') ||
  article.title?.toLowerCase().includes('azienda') ||
  article.title?.toLowerCase().includes('sicurezza') ||
  article.title?.toLowerCase().includes('privacy') ||
  article.title?.toLowerCase().includes('hack') ||
  article.title?.toLowerCase().includes('data') ||
  article.title?.toLowerCase().includes('cloud') ||
  article.title?.toLowerCase().includes('ai') ||
  article.title?.toLowerCase().includes('tech') ||
  article.description?.toLowerCase().includes('azienda') ||
  article.description?.toLowerCase().includes('startup');

function filterValidArticles(articles) {
  return articles.filter(article =>
    filterAds(article) &&
    filterGuides(article) &&
    filterTechContent(article)
  );
}

function selectRandomArticle(validArticles) {
  const randomIndex = Math.floor(Math.random() * Math.min(validArticles.length, config.NEWS_API_ARTICLES_LIMIT));
  return validArticles[randomIndex];
}

async function fetchWebContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': config.USER_AGENT
      }
    });
    if (!response.ok) return null;

    const html = await response.text();
    const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return textContent.substring(0, config.WEB_CONTENT_MAX_LENGTH);
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

    const response = await fetch(config.MISTRAL_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.MISTRAL_MODEL,
        messages: [
          {
            role: 'user',
            content: mistralPrompt
          }
        ],
        max_tokens: config.PROMPT_MAX_TOKENS,
        temperature: config.PROMPT_TEMPERATURE
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

function formatCommentForDiscord(aiComment) {
  return aiComment
    .replace(/\([^)]*\)/g, '')
    .replace(/["'"]/g, '')
    .replace(/\?[^?]*$/g, '')
    .replace(/\?/g, '')
    .replace(/\. /g, '.\n\n')
    .replace(/! /g, '!\n\n')
    .replace(/\n\n\n+/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function createArticleEmbed(article) {
  return {
    title: article.title || 'Nessun titolo',
    description: article.description ?
      (article.description.length > config.ARTICLE_DESCRIPTION_MAX_LENGTH ?
        article.description.substring(0, config.ARTICLE_DESCRIPTION_MAX_LENGTH) + '...' :
        article.description) :
      'Nessuna descrizione disponibile',
    url: article.url || '',
    color: 0x2b2d31,
    footer: {
      text: `Pubblicato: ${new Date(article.publishedAt).toLocaleDateString('it-IT')} • Fonte: ${article.source?.name || 'Sconosciuta'}`
    }
  };
}

async function processNewsArticle() {
  const behaviorPrompt = loadBehaviorPrompt();
  const randomTopic = getRandomDiscussionTopic();
  const url = buildNewsApiUrl(randomTopic);

  console.log('URL:', url.toString());
  console.log('Fetching URL:', url.toString());

  const response = await fetch(url.toString());

  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);

  if (!response.ok) {
    const errorText = await response.text();
    console.log('Error response:', errorText);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.articles || data.articles.length === 0) {
    return null;
  }

  const validArticles = filterValidArticles(data.articles);
  if (validArticles.length === 0) {
    return null;
  }

  const selectedArticle = selectRandomArticle(validArticles);
  const webContent = await fetchWebContent(selectedArticle.url);
  const aiComment = await generateAIComment(selectedArticle, webContent, behaviorPrompt);
  const formattedComment = formatCommentForDiscord(aiComment);
  const embed = createArticleEmbed(selectedArticle);

  return {
    comment: formattedComment,
    embed: embed,
    article: selectedArticle
  };
}

module.exports = {
  loadBehaviorPrompt,
  getRandomDiscussionTopic,
  buildNewsApiUrl,
  filterValidArticles,
  selectRandomArticle,
  fetchWebContent,
  generateAIComment,
  formatCommentForDiscord,
  createArticleEmbed,
  processNewsArticle
};
