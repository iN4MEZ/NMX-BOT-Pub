const { SlashCommandBuilder, } = require('@discordjs/builders');
const { PermissionFlagsBits, Routes } = require("discord.js");
const axios = require('axios');

const data = new SlashCommandBuilder()
    .setName('setbotprofile')
    .setDescription('Change avatar (profile) or banner of the bot')
    .addStringOption(option =>
        option.setName('type')
            .setDescription('Type: avatar or banner')
            .setRequired(true)
            .addChoices(
                { name: 'Avatar (profile picture)', value: 'avatar' },
                { name: 'Banner (banner picture)', value: 'banner' }
            )
    )
    .addAttachmentOption(option =>
        option.setName('imagefile')
            .setDescription('PNG or GIF image')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

module.exports = {
    data,
    async execute({ client, interaction }) {
        try {

            var action = interaction.options.get('type').value;

            const file = await interaction.options.getAttachment('imagefile');

            await interaction.deferReply();

            if (file.contentType !== "image/gif" && file.contentType !== 'image/png' && file.contentType !== 'image/jpeg') {

                interaction.editReply("❌ Plase use format PNG or GIF Format as Attachment");

                return;
            }

            const response = await axios.get(file.url, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data); // แปลงเป็น Buffer

            switch (action) {
                case "avatar":
                    await client.user.setAvatar(imageBuffer);
                    await sendMessage('✅ Your Bot Avatar Profile has been Changed');
                    break;
                case "banner":
                    await client.user.setBanner(imageBuffer);
                    await sendMessage("✅ Your Bot Banner Profile has been Changed");
                    break;

            }
            
            async function sendMessage(message) {
                await interaction.editReply(message);  
            }

        } catch (err) {
            console.log(err);
        }
    }
}