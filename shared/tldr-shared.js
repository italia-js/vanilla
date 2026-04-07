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

function getCleanHostname(rawUrl) {
  return new URL(rawUrl).hostname.replace(/^www\./, '');
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
 * Fetches an article's title (og:title, twitter:title, or <title>).
 * Returns null on any failure or timeout so callers can fallback gracefully.
 * @param {string} url
 * @returns {Promise<string|null>}
 */
async function fetchArticleTitle(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      headers: { 'User-Agent': config.USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const html = (await response.text()).slice(0, 50000);

    const title = metaContent(html, 'property', 'og:title')
      ?? metaContent(html, 'name', 'twitter:title')
      ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

    return title ? decodeEntities(title).trim() : null;
  } catch {
    return null;
  }
}

function metaContent(html, attr, key) {
  const pattern = new RegExp(
    `<meta[^>]+(?:${attr}=["']${key}["'][^>]+content=["']([^"']+)["']|content=["']([^"']+)["'][^>]+${attr}=["']${key}["'])`,
    'i'
  );
  const m = html.match(pattern);
  return m ? (m[1] ?? m[2]) : null;
}

function decodeEntities(str) {
  return str
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Generates a TLDR summary of an article using Groq.
 * @param {string} url - the article URL (used as context in the prompt)
 * @param {string} webContent - plain text scraped from the article
 * @returns {Promise<string>} formatted TLDR in Italian
 */
async function generateTldr(url, webContent) {
  const prompt = `Riassumi l'articolo per una community di senior software engineer. \
Scrivi SEMPRE il riassunto, qualunque sia l'argomento. \
Se l'articolo è tecnico: tono da collega developer, entra nei dettagli tecnici rilevanti. \
Se l'articolo non è tecnico: tono neutro, ma sempre dritto al punto. \
In entrambi i casi: italiano informale, diretto, senza fronzoli. Non sembrare un'AI, usa un linguaggio naturale come se parlassi a voce. Niente "sembra che", "pare che", "sembrerebbe". \
Struttura: una riga di contesto solo se aggiunge davvero qualcosa, poi massimo 3 bullet point con • che vanno dritti al punto, poi una riga finale solo se c'è qualcosa di rilevante da aggiungere. \
Niente intro generiche, niente "questo articolo parla di", niente conclusioni ovvie, niente preamboli. \
Non rifiutare mai di riassumere per via dell'argomento.

URL: ${url}
Contenuto: ${webContent}`;

  try {
    const response = await fetch(config.GROQ_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: config.GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.TLDR_MAX_TOKENS,
        temperature: config.TLDR_TEMPERATURE,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq API error: ${response.status} — ${errorBody}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? fallbackTldr();
  } catch (error) {
    console.error('Errore nella Groq API:', error);
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
    hostname = getCleanHostname(url);
  } catch {
    hostname = url;
  }

  return {
    title: `TLDR — ${hostname}`,
    description: tldrText,
    url,
    color: 0x5865f2,
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
  getCleanHostname,
  fetchArticleTitle,
  generateTldr,
  createTldrEmbed,
  createTldrButton,
  checkTldrCooldown,
  markTldrCooldown,
};
