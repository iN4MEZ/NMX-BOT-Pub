const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits,AttachmentBuilder  }=  require("discord.js");

const globalData = require('../global/data');

const data = new SlashCommandBuilder()
    .setName('checkglobalparameter')
    .setDescription('checking info')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

module.exports = {
    data,
    async execute({ client, interaction }) {

        try {
            const formattedJson = JSON.stringify(globalData, null, 2);
            
            const buffer = Buffer.from(formattedJson, 'utf-8');

            // สร้าง Attachment
            const attachment = new AttachmentBuilder(buffer, { name: 'data.json' });

            await interaction.reply({files: [attachment] });

        } catch (err) {
            await interaction.reply({content: `💀 An Error: ${err}` });
        }
    }
}