const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');

const fs = require('fs');

const globalData = require('../global/data');

const { setTimeout: sleep } = require('timers/promises');

const data = new SlashCommandBuilder()
.setName('search')
.setDescription('search Artist by name')
.addStringOption(option => option.setName('name').setDescription('name of artists').setRequired(true).setAutocomplete(true))
.addStringOption(option => option.setName('offset').setDescription("it's mean what data located. you can enter as you want motherfucker.")
    .setRequired(true))

module.exports = {
    data,
    async execute({interaction}) {

        if (interaction.commandName === "search" && !interaction.isAutocomplete()) {
            try {
                const artistId = interaction.options.get('name').value;
                const offset = interaction.options.get('offset').value;
        
                const creatorCache = JSON.parse(fs.readFileSync('./assets/data/artists.json'));
                const data = creatorCache.find((aData) => aData.id === artistId);
        
                const postData = await axios.get(`https://kemono.su/api/v1/${data.service}/user/${data.id}?o=${offset * 50}`);

                // ดึงเฉพาะ field ที่จำเป็น
                const filteredData = postData.data.map((artist) => ({
                    path: artist.file.path,
                    attachments: artist.attachments
                }));
        
                await interaction.channel.send(`Fetching ${filteredData.length} posts...`);

                await interaction.deferReply();
        
                for (let i = 0; i < filteredData.length; i++) {
                    const post = filteredData[i];
                    const imagePaths = [];
        
                    if (post?.path) {
                        imagePaths.push(post.path);
                    }
        
                    if (Array.isArray(post.attachments)) {
                        for (const attPost of post.attachments) {
                            if (typeof attPost.path === 'string' && /\.(png|jpe?g|gif)$/i.test(attPost.path)) {
                                imagePaths.push(attPost.path);
                            }
                        }
                    }

                    for (const path of imagePaths) {
                        const fullUrl = `https://kemono.su/data${path}`;
        
                        try {
                            const attachment = new AttachmentBuilder(fullUrl);
                            await interaction.channel.send({ files: [attachment] });

                        } catch (err) {
                            console.error(`Failed to send image: ${path}`, err);
                        }
        
                        await new sleep(globalData.sendImagePerDelay); // Delay per image
                    }
                }
        
                await interaction.channel.send(`✅ All posts sent.`);
            } catch (err) {
                console.error(err);
                await interaction.reply("❌ An error occurred while processing your request.");
            }
        }
        
    }
}