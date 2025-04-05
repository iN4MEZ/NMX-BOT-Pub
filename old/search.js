const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');

const artistData = require('../assets/data/creators.json');

const data = new SlashCommandBuilder()
.setName('search')
.setDescription('search Artist by name')
.addStringOption(option => option.setName('name').setDescription('name of artists').setRequired(true).setAutocomplete(true))
.addStringOption(option => option.setName('offset').setDescription("it's mean what data located. you can enter as you want motherfucker.")
    .setRequired(true))

module.exports = {
    data,
    async execute({client,interaction}) {
        try {
            if (interaction.commandName == "search" && !interaction.isAutocomplete()) {
                var artistId = interaction.options.get('name').value;
                var offset = interaction.options.get('offset').value;
                var data = artistData.find((aData) => aData.id == artistId);
    
                var postData = await axios.get(`https://kemono.su/api/v1/${data.service}/user/${data.id}?o=${offset * 50}`);
    
                var postLink = [];
                postData.data.forEach(post => {
    
                    postLink.push(post.file.path);
    
                    post.attachments.forEach(attPost => {
                        if (attPost.path.endsWith('.png') || attPost.path.endsWith('.jpg') || attPost.path.endsWith('.jpeg') || attPost.path.endsWith('.gif')) {
    
                            if (attPost.path !== undefined) {
                                postLink.push(attPost.path);
                            }
                        }
                    });
                });
    
                await postLink.forEach((postData, index) => {
                    setTimeout(async () => {
                        if (postData !== undefined) {    
                            try {
                                var attImg = new AttachmentBuilder(`https://kemono.su/data${postData}`);
                                await interaction.channel.send({ files: [attImg]});
                                console.log(postData + " Sending Success");
                                attImg = [];
                            } catch(err) {
                                console.log(err);

                                if(err) { return; }
                            } finally {
                            }
                        }
                    }, 6000 * index);
                });
                await interaction.reply("Requested!");
                await interaction.channel.send("Sending Post of" + postLink.length);
                postLink = []
            }
        } catch(err) {
            console.log(err);
        }
    }
}