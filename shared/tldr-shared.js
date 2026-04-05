const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config/constants');

// Hosts that are never articles (social media, video, etc.)
const BLOCKED_HOSTS = new Set([
  'youtube.com', 'youtu.be',
  'twitter.com', 'x.com',
  'instagram.com', 'tiktok.com',
  'facebook.com', 'fb.com',
  'reddit.com', 'twitch.tv',
  'discord.com', 'discord.gg',
  'github.com', 'gist.github.com',
  'linkedin.com',
  'spotify.com', 'soundcloud.com',
  'imgur.com', 'giphy.com',
]);

const BLOCKED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|mp4|mp3|pdf|zip)$/i;
const URL_REGEX = /https?:\/\/[^\s<>"]+/g;

/**
 * Finds the first article-like URL in a string.
 * @param {string} text
 * @returns {string|null}
 */
function extractArticleUrl(text) {
  const matches = text.match(URL_REGEX);
  if (!matches) return null;
  return matches.find(url => isArticleUrl(url)) ?? null;
}

/**
 * Returns true if the URL looks like an article (not social media, not a media file).
 * @param {string} rawUrl
 * @returns {boolean}
 */
function isArticleUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    const hostname = url.hostname.replace(/^www\./, '');
    if (BLOCKED_HOSTS.has(hostname)) return false;
    if (BLOCKED_EXTENSIONS.test(url.pathname)) return false;

    // Reject bare domains with no meaningful path (e.g. https://google.com)
    if (url.pathname === '/' || url.pathname === '') return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Generates a TLDR summary of an article using Google Gemini.
 * @param {string} url - the article URL (used as context in the prompt)
 * @param {string} webContent - plain text scraped from the article
 * @returns {Promise<string>} formatted TLDR in Italian
 */
async function generateTldr(url, webContent) {
  const prompt = `Sei un developer senior che riassume articoli tecnici per colleghi. \
Scrivi in italiano informale, diretto, senza fronzoli. \
Non sembrare un'AI: usa un linguaggio naturale, come se spiegassi a voce a un collega. \
Struttura: una riga di contesto (solo se aggiunge davvero qualcosa), poi massimo 3 bullet point con • che vanno dritti al punto tecnico, poi una riga finale solo se c'è qualcosa di rilevante da aggiungere. \
Niente intro generiche, niente "questo articolo parla di", niente conclusioni ovvie. \
Se il contenuto è scarso o non tecnico, dillo chiaramente in una riga sola.

URL: ${url}
Contenuto: ${webContent}`;

  try {
    const endpoint = `${config.GEMINI_API_BASE_URL}/${config.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: config.TLDR_MAX_TOKENS,
          temperature: config.TLDR_TEMPERATURE,
        },
      }),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? fallbackTldr();
  } catch (error) {
    console.error('Errore nella Gemini API:', error);
    return fallbackTldr();
  }
}

function fallbackTldr() {
  return '• Non è stato possibile generare il TLDR. Prova ad aprire l\'articolo direttamente.';
}

/**
 * Creates a Discord embed for a TLDR result.
 * @param {string} url
 * @param {string} tldrText
 * @returns {object}
 */
function createTldrEmbed(url, tldrText) {
  let hostname;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    hostname = url;
  }

  return {
    title: `TLDR — ${hostname}`,
    description: tldrText,
    url,
    color: 0x5865f2,
    footer: { text: 'Generato da Gemini AI' },
  };
}

/**
 * Creates the Discord ActionRow containing the "Genera TLDR" button.
 * The customId encodes only the messageId so state is recovered by re-fetching the message.
 * @param {string} messageId
 * @returns {ActionRowBuilder}
 */
function createTldrButton(messageId) {
  const button = new ButtonBuilder()
    .setCustomId(`tldr:${messageId}`)
    .setLabel(config.TLDR_BUTTON_LABEL)
    .setStyle(ButtonStyle.Primary);

  return new ActionRowBuilder().addComponents(button);
}

// In-memory per-message cooldown to prevent duplicate TLDRs on the same article.
const tldrCooldowns = new Map();

/**
 * @param {string} messageId
 * @returns {boolean} true if the TLDR can be generated (not on cooldown)
 */
function checkTldrCooldown(messageId) {
  const last = tldrCooldowns.get(messageId);
  if (!last) return true;
  return Date.now() - last > config.TLDR_COOLDOWN_MS;
}

/**
 * @param {string} messageId
 */
function markTldrCooldown(messageId) {
  tldrCooldowns.set(messageId, Date.now());
  setTimeout(() => tldrCooldowns.delete(messageId), config.TLDR_COOLDOWN_MS);
}

module.exports = {
  extractArticleUrl,
  isArticleUrl,
  generateTldr,
  createTldrEmbed,
  createTldrButton,
  checkTldrCooldown,
  markTldrCooldown,
};
