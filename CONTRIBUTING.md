# Contributing

Follow this guide if you wish to help with the development of this community project.

## Purpose

Any community on Discord could use a little help managing the day to day activities and delivering to its user the best possible experience.

There's a lot of bots available out there, but carelessly adding bots to gather all the features we like might be cumbersome and add too much overhead.

This project aims to reduce this overhead developing a bot for the community and with the community.

## Get ready

To contribute to the code you'll need to:

- Setup your local machine
- Create for free a Discord developer account
- Get a token for your development bot
- Create a Discord server, for testing purposes
- Invite the bot to your server

All of this will be explained step-by-step.

## Local machine setup

If you made this far you most likely know the drill:

1. Install the latest [Node.js](https://nodejs.org/en/) LTS (using [nvm](https://github.com/nvm-sh/nvm) or similar library is highly recommended).

1. Clone this repository

1. Execute `npm install`

## Discord developer account (free)

Here's a walkthrough to get up and running with Discord:

1. Sign up or login to [Discord Developer Portal](https://discord.com/developers/applications), you can also use the QR code provided for logging in via mobile app.
   ![discord login](./img/discord-login.jpg)

1. In the dashboard, click _New Application_ on the top right.
   ![discord dashboard](./img/discord-dashboard.jpg)

1. Specify a name for your application (e.g. VanillaDev) and click _Create_.
   ![discord new app](./img/discord-new-app.jpg)

1. This is how your app overview looks like, **do not share client secret** under any circumstance.
   ![discord app overview](./img/discord-app-overview.jpg)

1. Navigate to the _Bot_ section, then click _Add Bot_.
   ![discord app add bot](./img/discord-app-add-bot.jpg)

1. This is how your bot overview looks like, **do not share token** under any circumstance.
   ![discord app bot overview](./img/discord-app-bot-overview.jpg)

For further information please refer to the [official Discord documentation](https://discord.com/developers/docs/intro).

## Getting your bot token

For local development you need to provide your bot token as follows:

1. Open your browser.

1. Navigate to your dashboard on [Discord Developer Portal](https://discord.com/developers/applications/).

1. Select the application you created.

1. Navigate to the *Bot* section.

1. Click *Copy* underneath *TOKEN*.  
   ![discord bot copy token](./img/discord-bot-copy-token.jpg)

1. Open your IDE or editor of choice (e.g. [Visual Studio Code](https://code.visualstudio.com/)).

1. Open the folder where you cloned this repository.

1. Create in the root folder a file called `.env`.

1. Open the file `.env`.

1. Add a single line without spaces pasting the token you copied like this:
```
ITALIAJS_BOT_TOKEN=PASTE_HERE_YOUR_TOKEN
```

## Running your bot

To run your bot for development:

1. Open a terminal.

1. Navigate to the folder where you cloned this repository.

1. Execute `npm run dev`.

## Discord server creation

You need a Discord server to test your bot. To create one follow these steps:

1. Open your Discord client.

1. Click the `+` icon in the bottom left.

1. Click the option *Create My Own*.  
   ![discord create a server](./img/discord-create-a-server.jpg)

1. Customize your server adding a name and optionally an icon.  
   ![discord customize your server](./img/discord-customize-your-server.jpg)

## Bot invitation

A Discord bot is like a special user that needs to be invited to your server with a specific set of permissions, depending on the bot functionalities.

Here's a walkthrough:

1. Open your browser.

1. Navigate to your dashboard on [Discord Developer Portal](https://discord.com/developers/applications/).

1. Select the application you created.

1. Navigate to the section *General Information*.

1. Click *Copy* underneath *CLIENT ID*.

1. Navigate to [Discord Permissions Calculator](https://discordapi.com/permissions.html#388208), to facilitate this link has already been set with the correct permissions for this project.  
   ![discord bot permissions](./img/discord-bot-permissions.jpg)

1. Paste the Client ID you copied in the proper field.

1. Click the link.









