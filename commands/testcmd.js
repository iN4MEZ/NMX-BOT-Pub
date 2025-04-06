const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('test')
    .setDescription('test')

module.exports = {
    data,
    async execute({ client, interaction }) {

        await interaction.channel.send("TEST!");
    }
}