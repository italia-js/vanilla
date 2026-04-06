module.exports = {
  // News API Configuration
  NEWS_API_BASE_URL: 'https://newsapi.org/v2/everything',
  NEWS_API_LANGUAGE: 'it',
  NEWS_API_SORT_BY: 'publishedAt',
  NEWS_API_PAGE_SIZE: 20,
  NEWS_API_ARTICLES_LIMIT: 5,

  // Mistral AI Configuration
  MISTRAL_API_BASE_URL: 'https://api.mistral.ai/v1/chat/completions',
  MISTRAL_MODEL: 'mistral-small-latest',
  PROMPT_MAX_TOKENS: 200,
  PROMPT_TEMPERATURE: 0.8,

  // Bot Configuration
  INTERVAL_MINUTES: 300, // 5 hours
  INTERVAL_MINUTES_TEST: 0.1, // 10 seconds for testing
  WEB_CONTENT_MAX_LENGTH: 3500,
  ARTICLE_DESCRIPTION_MAX_LENGTH: 200,

  // Discord Configuration
  EMBED_COLOR: '#ffe000',
  GITHUB_REPO: 'italia-js/vanilla',
  CHANNEL_NAME: '782921551225028624',
  CHANNEL_NAME_TEST: '1395516330563735625',

  // Web scraping
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',

  // Feature Flags
  AI_BOT_ENABLED: process.env.AI_BOT_ENABLED === 'true',

  // Groq AI Configuration (for TLDR feature)
  GROQ_API_BASE_URL: 'https://api.groq.com/openai/v1/chat/completions',
  GROQ_MODEL: 'llama-3.3-70b-versatile',

  // TLDR Feature
  TLDR_MAX_TOKENS: 400,
  TLDR_TEMPERATURE: 0.8,
  TLDR_COOLDOWN_MS: 60_000,
  TLDR_BUTTON_LABEL: 'Genera TLDR',
};
