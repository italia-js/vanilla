# Vanilla

Vanilla is a bot created with [Node.js](https://nodejs.org/) and [Discord.js](https://discord.js.org/) for [Italia JS](https://italia-js.org) by members of its community.

It's an [open source](https://en.wikipedia.org/wiki/Open_source) project, everybody is welcome to suggest new features or improve existing ones.

If you're interested in being involved on a more regular basis, contact `@granze` on [our Discord server](https://discord.gg/RWVhXuJUVN) to join the dev team. You'll be granted a role, a special color, and access to the private channel `#vanilla-dev`, not to mention eternal gratitude from the community.

Developing commands for Vanilla is a lot of fun, and it can be a good starting point to approach open source.

Looking forward to see your contribution! 💪

# Structure

DEPLOY COMMANDS
update bot commands list
push update into prod
deploy-commands.js
We deploy commands so discord will expect these commands
BOT WORKFLOW
Will ask for response
User ask help
Will give response
Will get response
Ask for how the commands works
Gives response
If VPS or local is off i wont give any response

## Structure

### npm run deploy-commands
`dev/vps -> Discord so discord records the commands`

### user use commands
`user -> bot -> discord -> dev/vps -> discord -> user`

## How to create a new command

1. Create a new file in the `commands` folder.
2. Create a new class that extends the `SlashCommandBuilder` class.
3. Add the command to the `commands` array in the `index.js` file.
4. Run the `npm run deploy-commands` command to deploy the command to the Discord server.

## Contributing

If you'd like to help out with the development of this project, please refer to the [contribution guide](./CONTRIBUTING.md).
