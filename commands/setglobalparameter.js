const { SlashCommandBuilder } = require('@discordjs/builders');

const globalData = require('../global/data');

const data = new SlashCommandBuilder()
    .setName('setglobalparameter')
    .setDescription('set data')
    .addStringOption(option => option.setName('mode').setDescription('what your want to set').setRequired(true).setAutocomplete(true))
    .addIntegerOption(option => option.setName('delay').setDescription('delay MS').setRequired(true))

module.exports = {
    data,
    async execute({ client, interaction }) {
        var mode = interaction.options.get('mode').value;
        var delay = interaction.options.get('delay').value;

        await interaction.deferReply();

        try {
            if(mode in globalData) {
                await interaction.channel.send(`✅Changed Value Of Mode ${mode} From ${globalData[mode]} to ${delay}`);
    
                globalData[mode] = delay;
    
            } else {
                await interaction.channel.send(`❌ Parameter Not Found`);
            }
        } catch(err) {
            await interaction.channel.send(`❌ An error to change global data ` + err);
        }

        await interaction.editReply({content: "Well done!"});

    }
}