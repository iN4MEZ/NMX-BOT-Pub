const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('test')
    .setDescription('test')

module.exports = {
    data,
    async execute({ client, interaction }) {
        const channel = await client.channels.fetch('1357120803203715083');

        await channel.send("TEST!");
    }
}