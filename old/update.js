const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const axios = require('axios');
const fs = require('fs');

const data = new SlashCommandBuilder()
    .setName('update')
    .setDescription('update data')




module.exports = {
    data,
    async execute({ client, interaction }) {
        await interaction.reply("Update...")
        await axios.get('https://kemono.su/api/v1/creators.txt')
            .then(response => {
                const jsonData = response.data; // Assuming the response data is JSON

                // Convert JSON data to a string
                const jsonString = JSON.stringify(jsonData, null, 2);

                // fs.readdir('./assets/data/',(err,fields) => {
                //     fields.forEach((file)=>{

                //         fs.unlink('./assets/data/'+ file , (error)=> {
                //             if ( error ) throw error ;
                //             console.log(`Deleted ${file}`) ;    
                //         });
                //     });
                        
                // });


                // Write the JSON string to a file
                fs.writeFile('./assets/data/creators.json', jsonString,'utf8', err => {
                    if (err) {
                        console.error('Error writing file:', err);
                    } else {
                        console.log('File successfully written');
                        interaction.channel.send("Done!")
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
}