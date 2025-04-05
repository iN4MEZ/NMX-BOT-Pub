require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const sagiri = require("sagiri");

const source = sagiri(process.env.SOURCENAOAPI);

const data = new SlashCommandBuilder()
    .setName('find')
    .setDescription('find')
    .addAttachmentOption(option =>
        option.setName("picture")
            .setDescription("Find The source")
            .setRequired(true)
    )
module.exports = {
    data,
    async execute({ client, interaction }) {

        try {

            const data = await interaction.options.getAttachment('picture');

            const url = data.url

            await interaction.channel.send("Finding!");

            const results = await source(url);

            if (!results) { return; }

            results.forEach(async (source) => {

                const found = source.raw.data;

                //console.log(found);

                if (source.similarity > 90 && found != undefined) {
                    const sourceFoundEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(found.authorName)
                        .setURL(found.authorUrl)
                        .setDescription("กดด้านบน ไอโง่")
                        .setThumbnail(source.thumbnail)
                        .addFields(
                            { name: '\u200B', value: '\u200B' },
                            { name: 'Posibility', value: ">90%", inline: true },
                            { name: 'Characters', value: found.characters ? found.characters : "?", inline: true },
                        )
                        .addFields({ name: 'Material', value: found.material ? found.material : "?", inline: true })
                        .setImage(source.thumbnail)
                        .setTimestamp()
                        .setFooter({ text: 'Field Is gay' });

                    await interaction.channel.send({ embeds: [sourceFoundEmbed] });
                    return;
                }

                else {
                    if (source.similarity > 70 && source.similarity < 90) {

                        let firstIndexData = results[0].raw.data;

                        if(firstIndexData) {
                            const firstIndex = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle(firstIndexData.creator ? firstIndexData.creator : "Click me")
                            .setURL(firstIndexData.ext_urls[0] ? firstIndexData.ext_urls[0] : "???")
                            .setDescription("กดด้านบน ไอโง่")
                            .setThumbnail(source.thumbnail)
                            .addFields(
                                { name: '\u200B', value: '\u200B' },
                                { name: 'Posibility', value: "100%", inline: true },
                                { name: 'Characters', value: firstIndexData.characters ? firstIndexData.characters : "IDK", inline: true },
                            )
                            .addFields({ name: 'Material', value: firstIndexData.material ? firstIndexData.material : "?", inline: true })
                            .setImage(firstIndexData.thumbnail)
                            .setTimestamp()
                            .setFooter({ text: 'Field Is gay' });

                            await interaction.channel.send({ embeds: [firstIndex] });
                            return;
                        }


                        const sourceEmbed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle(source.authorName)
                            .setURL(source.authorUrl)
                            .setDescription("กดด้านบน ไอโง่")
                            .setThumbnail(source.thumbnail)
                            .addFields(
                                { name: '\u200B', value: '\u200B' },
                                { name: 'Posibility', value: "<70%", inline: true },
                                { name: 'Characters', value: "?", inline: true },
                            )
                            .addFields({ name: 'Material', value: "?", inline: true })
                            .setImage(source.thumbnail)
                            .setTimestamp()
                            .setFooter({ text: 'Field Is gay' });

                        await interaction.channel.send({ embeds: [sourceEmbed] });
                    }
                }
            });
        } catch (err) {
            await interaction.channel.send("Error:" + err.statusCode + " " + err.message);
        }
    }
}