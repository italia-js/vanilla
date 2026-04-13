const https = require('https');
const constants = require('../config/constants');

class MistralService {
  constructor() {
    this.apiKey = process.env.MISTRAL_TOKEN;
    this.baseUrl = constants.MISTRAL_THREAD_API_BASE_URL;
  }

  /**
	 * This method generates a title for a given message content.
	 */
  async generateTitle(messageContent) {
    if (!this.apiKey) {
      console.warn('MISTRAL_TOKEN not found, using fallback title generation');
      return this.generateFallbackTitle(messageContent);
    }

    try {
      const prompt = `Analizza questo messaggio Discord e crea un titolo breve e descrittivo in italiano che riassuma l'argomento principale. Il titolo deve essere chiaro e informativo, non una copia del testo.  Messaggio: "${messageContent}" Crea un titolo che riassuma l'argomento:, Non scrivermelo in formato .md`;

      const response = await this.makeRequest({
        model: constants.MISTRAL_THREAD_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: constants.MISTRAL_THREAD_TEMPERATURE,
        max_tokens: constants.MISTRAL_THREAD_MAX_TOKENS
      });

      if (response.choices && response.choices[0]) {
        return this.cleanTitle(response.choices[0].message.content);
      }

      return this.generateFallbackTitle(messageContent);
    } catch (error) {
      console.error('Mistral API error:', error);
      return this.generateFallbackTitle(messageContent);
    }
  }

  /**
	 * Using regex to clean the text
	 */
  cleanTitle(text) {
    return text
      .split('\n')[0]
      .trim()
      .replace(/([^a-z0-9 ._-]+)/gi, '')
      .replace(/\.$/, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      .substring(0, constants.AUTOTHREADS_TITLE_MAX_LENGTH);
  }

  generateFallbackTitle(messageContent) {
    const words = messageContent.split(' ').slice(0, constants.FALLBACK_TITLE_WORDS_COUNT).join(' ');
    return words.length > constants.FALLBACK_TITLE_MAX_LENGTH ?
      words.substring(0, constants.FALLBACK_TITLE_MAX_LENGTH - constants.FALLBACK_TITLE_ELLIPSIS_OFFSET) + '...' : words;
  }

  makeRequest(data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);

      const options = {
        hostname: 'api.mistral.ai',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            resolve(parsedData);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }
}

module.exports = new MistralService();
