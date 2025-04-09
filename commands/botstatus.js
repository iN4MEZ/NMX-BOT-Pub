const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('setbotstatus')
    .setDescription('message for status')

module.exports = {
    data,
    async execute({ client, interaction }) {

        await interaction.channel.send("TEST!");
    }
}