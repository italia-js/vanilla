# Vanilla

Vanilla is a bot created with [Node.js](https://nodejs.org/) and [Discord.js](https://discord.js.org/) for [Italia JS](https://italia-js.org) by members of its community.

It's an [open source](https://en.wikipedia.org/wiki/Open_source) project, everybody is welcome to suggest new features or improve existing ones.

If you're interested in being involved on a more regular basis, contact `@granze` on [our Discord server](https://discord.gg/RWVhXuJUVN) to join the dev team. You'll be granted a role, a special color, and access to the private channel `#vanilla-dev`, not to mention eternal gratitude from the community.

Developing commands for Vanilla is a lot of fun, and it can be a good starting point to approach open source.

Looking forward to see your contribution! 💪

# Structure

<img width="3368" height="4444" alt="image" src="https://github.com/user-attachments/assets/5df866a7-06c9-4594-a0c9-b9921554c674" />

### Deploy Commands npm run deploy-commands
`dev/vps -> Discord so discord records the commands`

### Bot Workflow
`user -> bot -> discord -> dev/vps -> discord -> user`

## How to create a new command

1. Create a new file in the `commands` folder.
2. Create a new class that extends the `SlashCommandBuilder` class.
3. Add the command to the `commands` array in the `index.js` file.
4. Run the `npm run deploy-commands` command to deploy the command to the Discord server.

## How to run the project

1. First of all run the command `rm -rf node_modules` to remove the `node_modules` folder if it exists. This is done to resolve any potential issues with outdated dependencies.
   This step is optional but recommended to ensure a clean installation.
2. Run `nvm use` to switch to the correct Node.js version.
3. Run `npm i` to install the required dependencies.
4. Create a `.env` file and configure the required environment variables:
  - `DISCORD_TOKEN`
  - `GUILD_ID`
5. Run `npm run dev` to start the bot in development mode.
6. Join the Discord server and test the available commands.

## Contributing

If you'd like to help out with the development of this project, please refer to the [contribution guide](./CONTRIBUTING.md).
