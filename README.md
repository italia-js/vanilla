# Vanilla

Vanilla is a bot created with [Node.js](https://nodejs.org/) and [Discord.js](https://discord.js.org/) for [Italia JS](https://italia-js.org) by members of its community.

It's an [open source](https://en.wikipedia.org/wiki/Open_source) project, everybody is welcome to suggest new features or improve existing ones.

If you're interested in being involved on a more regular basis, contact `@granze` on [our Discord server](https://discord.gg/RWVhXuJUVN) to join the dev team. You'll be granted a role, a special color, and access to the private channel `#vanilla-dev`, not to mention eternal gratitude from the community.

Developing commands for Vanilla is a lot of fun, and it can be a good starting point to approach open source.

Looking forward to see your contribution! 💪

# Figma

<img width="3368" height="4444" alt="image" src="https://github.com/user-attachments/assets/58725e89-3ff6-41d2-ac9f-85b995c518f0" />

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
