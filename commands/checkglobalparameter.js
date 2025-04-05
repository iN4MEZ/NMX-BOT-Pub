const { SlashCommandBuilder } = require('@discordjs/builders');

const globalData = require('../global/data');

const data = new SlashCommandBuilder()
    .setName('checkglobalparameter')
    .setDescription('checking info')

module.exports = {
    data,
    async execute({ client, interaction }) {

        await interaction.reply(JSON.stringify(globalData));
    }
}