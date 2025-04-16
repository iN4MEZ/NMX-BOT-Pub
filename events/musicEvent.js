const { Riffy } = require('riffy');

const { dynamicCard } = require("../assets/UI/dynamicCard");
const musicIcons = require('../assets/UI/icons/musicicons');

const path = require('node:path');

const { ButtonBuilder,EmbedBuilder, ActionRowBuilder, ButtonStyle,AttachmentBuilder } = require('discord.js');

module.exports = {
    name: 'ready',
    async execute(interaction, client) {
        try {

            const nodes = [
                {
                    identifier: "Avinan",
                    host: "new-york-node-1.vortexcloud.xyz",
                    password: "avinan",
                    port: 5008,
                    secure: false
                }
            ];

            client.riffy = new Riffy(client, nodes, {
                send: (payload) => {
                    const guild = client.guilds.cache.get(payload.d.guild_id);
                    if (guild) guild.shard.send(payload);
                },
                defaultSearchPlatform: "ytmsearch",
                restVersion: "v4", // Or "v3" based on your Lavalink version.
            });

            client.riffy.init(client.user.id);
            console.log(`✅ riffy was init!`);

            client.riffy.on('nodeConnect', (node) => {
                console.log(`\x1b[34m[ LAVALINK CONNECTION ]\x1b[0m Node connected: \x1b[32m${node.name}\x1b[0m`);
            });

            client.riffy.on('nodeError', (node, error) => {
                console.error(`\x1b[31m[ LAVALINK ]\x1b[0m Node \x1b[32m${node.name}\x1b[0m had an error: \x1b[33m${error.message}\x1b[0m`);
            });

            client.riffy.on('trackStart', async (player, track) => {

                const channel = client.channels.cache.get(player.textChannel);

                function formatTime(ms) {
                    if (!ms || ms === 0) return "0:00";
                    const totalSeconds = Math.floor(ms / 1000);
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;
                    return `${hours > 0 ? hours + ":" : ""}${minutes.toString().padStart(hours > 0 ? 2 : 1, "0")}:${seconds.toString().padStart(2, "0")}`;
                }

                try {
                    const cardImage = await dynamicCard({
                        thumbnailURL: track.info.thumbnail,
                        songTitle: track.info.title,
                        songArtist: track.info.author,
                        trackRequester: track.requester ? track.requester.username : "All In One",
                        fontPath: path.join(__dirname, "../assets/UI", "fonts", "AfacadFlux-Regular.ttf"),
                        backgroundColor: "#FF00FF",
                    });
            
                    const attachment = new AttachmentBuilder(cardImage, { name: 'songcard.png' });
            
                    const description = `- Title: ${track.info.title} \n`+
                    ` - Artist: ${track.info.author} \n`+
                    ` - Length: ${formatTime(track.info.length)} (\`${track.info.length}ms\`) \n`+
                    ` - Stream: ${track.info.stream ? "Yes" : "No"} \n`+
                    ` - Seekable: ${track.info.seekable ? "Yes" : "No"} \n`+
                    ` - URI: [Link](${track.info.uri}) \n`+
                    ` - Source: ${track.info.sourceName} \n`+ 
                    ` - Requested by: ${track.requester ? `<@${track.requester.id}>` : "Unknown"}`; 
                    
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: "Now Playing..", iconURL: musicIcons.playerIcon })
                        .setDescription(description)
                        .setImage('attachment://songcard.png')
                        .setFooter({ text: 'Let the Beat Drop!', iconURL: musicIcons.footerIcon })
                        .setColor('#00c3ff');


                        await channel.send({ embeds: [embed], });
                } catch(err) {
                    console.log(err);
                }

                // if (player.currentMessageId) {

                //     try {
                //         const oldMessage = await channel.messages.fetch(player.currentMessageId);
                //         if (oldMessage) {
                //             const disabledComponents = oldMessage.components.map(row => {
                //                 return new ActionRowBuilder().addComponents(
                //                     row.components.map(button => ButtonBuilder.from(button).setDisabled(true))
                //                 );
                //             });
                //             await oldMessage.edit({ components: disabledComponents });
                //         }
                //     } catch (err) {
                //         console.warn("Previous message not found (likely deleted), skipping edit.");
                //     }
                // }
                // let components = [];

                // if (track.requester && track.requester.id) {
                //     const buttonsRow = new ActionRowBuilder().addComponents(
                //         new ButtonBuilder().setCustomId(`volume_up_${track.requester.id}`).setEmoji('🔊').setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder().setCustomId(`volume_down_${track.requester.id}`).setEmoji('🔉').setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder().setCustomId(`pause_${track.requester.id}`).setEmoji('⏸️').setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder().setCustomId(`resume_${track.requester.id}`).setEmoji('▶️').setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder().setCustomId(`skip_${track.requester.id}`).setEmoji('⏭️').setStyle(ButtonStyle.Secondary)
                //     );

                //     const buttonsRow2 = new ActionRowBuilder().addComponents(
                //         new ButtonBuilder().setCustomId(`stop_${track.requester.id}`).setEmoji('⏹️').setStyle(ButtonStyle.Danger),
                //         new ButtonBuilder().setCustomId(`clear_queue_${track.requester.id}`).setEmoji('🗑️').setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder().setCustomId(`show_queue_${track.requester.id}`).setEmoji('📜').setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder().setCustomId(`shuffle_${track.requester.id}`).setEmoji('🔀').setStyle(ButtonStyle.Secondary),
                //         new ButtonBuilder().setCustomId(`loop_${track.requester.id}`).setEmoji('🔁').setStyle(ButtonStyle.Secondary)
                //     );

                //     components = [buttonsRow, buttonsRow2];

                //     await channel.send({ components: components });
                // }
            });

            client.riffy.on('trackEnd', async (player, track) => {
                const channel = client.channels.cache.get(player.textChannel);
                if (player.currentMessageId) {
                    try {
                        const oldMessage = await channel.messages.fetch(player.currentMessageId,{limit: 3});
                        if (oldMessage) await oldMessage.delete();
                    } catch (err) {
                        console.error("Failed to delete finished song message:", err);
                    }
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
};