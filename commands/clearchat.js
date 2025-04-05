const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('clearchat')
    .setDescription('clear the chat')
    .addStringOption(option => option.setName('limit').setDescription('limit of message').setRequired(true));

module.exports = {
    data,
    async execute({ client, interaction }) {
        var limit = interaction.options.get('limit').value;
        interaction.channel.messages.fetch({ limit: limit }).then(async (messages) => {
            //Iterate through the messages here with the variable "messages".
            messages.forEach(message => {
                message.delete();
            })
            await interaction.reply(`Deleting ${messages.size}`); 
        })

    }
}