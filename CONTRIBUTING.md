# Contributing

Benvenuto/a! Questo progetto è pensato per imparare, contribuire alla community e fare pratica con l'open source. Ogni contributo è apprezzato.

## Prerequisiti

- [Node.js](https://nodejs.org/) v22.14.0 (consigliato: usa [nvm](https://github.com/nvm-sh/nvm) con il file `.nvmrc` già incluso)
- Un account [Discord Developer](https://discord.com/developers/applications) (gratuito)
- Un server Discord personale per i test

## Setup locale

```bash
# Se usi nvm
nvm use

npm install
cp env.example .env
```

Apri `.env` e compila le variabili necessarie (vedi sezione sotto).

## Variabili d'ambiente

| Variabile | Dove trovarla | Obbligatoria |
|---|---|---|
| `VANILLA_BOT_TOKEN` | Discord Developer Portal → Bot → Token | ✅ |
| `CLIENT_ID` | Discord Developer Portal → OAuth2 → Client ID | ✅ |
| `MISTRAL_TOKEN` | [console.mistral.ai](https://console.mistral.ai/) | Per funzionalità AI |
| `GROQ_API_KEY` | [console.groq.com/keys](https://console.groq.com/keys) | Per funzionalità TLDR |
| `NEWS_API_KEY` | [newsapi.org](https://newsapi.org/) | Per funzionalità notizie |
| `AI_BOT_ENABLED` | — | `true`/`false`, default `false` |

## Creare e configurare il bot Discord

1. Vai su [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**
2. Nella sezione **Bot**, clicca **Reset Token** per generare e copiare il token (`VANILLA_BOT_TOKEN`)
3. Nella sezione **Bot**, scorri fino a **Privileged Gateway Intents** e abilita **Server Members Intent** e **Message Content Intent**
4. Nella sezione **Bot**, assicurati che **Require OAuth2 Code Grant** sia **disabilitato**
5. Nella sezione **OAuth2**, copia il Client ID (`CLIENT_ID`)
6. Per invitare il bot al tuo server di test, apri nel browser questo URL sostituendo `CLIENT_ID` con il tuo:
   ```
   https://discord.com/oauth2/authorize?client_id=CLIENT_ID&permissions=388208&scope=bot+applications.commands
   ```

## Avviare il bot in locale

```bash
# Registra i comandi slash su Discord (va fatto solo la prima volta o quando aggiungi comandi)
npm run deploy-commands

# Avvia in modalità sviluppo (con hot reload)
npm run dev
```

Il bot apparirà online nel tuo server.

## Comandi disponibili

```bash
npm run dev          # Avvia con nodemon (hot reload)
npm run start        # Avvia senza hot reload
npm run lint         # Lint + autofix con ESLint
npm run deploy-commands  # Registra/aggiorna i comandi slash
```

## Struttura del progetto

```
commands/   # Comandi slash (raggruppati per categoria)
events/     # Event handlers Discord
shared/     # Logica condivisa tra comandi ed eventi
config/     # Costanti e configurazione
```

## Come contribuire

1. Fai il fork del repository
2. Crea un branch per la tua feature (`git checkout -b feat/nome-feature`)
3. Fai il commit delle modifiche
4. Apri una Pull Request verso `main`

Per domande o dubbi, apri una Issue o passa sul nostro server Discord.
