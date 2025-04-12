const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const axios = require('axios');

const data = new SlashCommandBuilder()
    .setName('autodm')
    .setDescription('test')

module.exports = {
    data,
    async execute({ client, interaction }) {

        const userId = "794413296124035083"; // รับ UID จากคำสั่ง

        if (!userId) {
            return console.log('กรุณาระบุ UserID หลังคำสั่ง เช่น !กำลังใจ <UserID>');
        }

        try {
            const channel = await client.channels.fetch('1358228500737298584');
            if (!channel) return;

            //const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
            await channel.send(`<@${userId}> is gay`);
            

        } catch (err) {
            console.error(err);
        }
    }
}