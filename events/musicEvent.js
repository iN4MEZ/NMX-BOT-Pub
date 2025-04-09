const { Riffy } = require('riffy');

const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'ready',
    async execute(interaction, client) {
        try {

            const nodes = [
                {
                    host: "ind1.zapto.org",
                    password: "yourpasswordhere",
                    port: 25575,
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
            console.log(`riffy was init!`);

            client.riffy.on('nodeConnect', (node) => {
                console.log(`\x1b[34m[ LAVALINK CONNECTION ]\x1b[0m Node connected: \x1b[32m${node.name}\x1b[0m`);
            });

            client.riffy.on('nodeError', (node, error) => {
                console.error(`\x1b[31m[ LAVALINK ]\x1b[0m Node \x1b[32m${node.name}\x1b[0m had an error: \x1b[33m${error.message}\x1b[0m`);
            });

            client.riffy.on('trackStart', async (player, track) => {

                if (player.currentMessageId) {
                    try {
                        const oldMessage = await channel.messages.fetch(player.currentMessageId,{limit: 3});
                        if (oldMessage) {
                            const disabledComponents = oldMessage.components.map(row => {
                                return new ActionRowBuilder().addComponents(
                                    row.components.map(button => ButtonBuilder.from(button).setDisabled(true))
                                );
                            });
                            await oldMessage.edit({ components: disabledComponents });
                        }
                    } catch (err) {
                        console.warn("Previous message not found (likely deleted), skipping edit.");
                    }
                }

                const interaction = require('../commands/playmusic').interaction;

                let components = [];

                if (track.requester && track.requester.id) {
                    const buttonsRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`volume_up_${track.requester.id}`).setEmoji('🔊').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`volume_down_${track.requester.id}`).setEmoji('🔉').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`pause_${track.requester.id}`).setEmoji('⏸️').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`resume_${track.requester.id}`).setEmoji('▶️').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`skip_${track.requester.id}`).setEmoji('⏭️').setStyle(ButtonStyle.Secondary)
                    );

                    const buttonsRow2 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`stop_${track.requester.id}`).setEmoji('⏹️').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId(`clear_queue_${track.requester.id}`).setEmoji('🗑️').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`show_queue_${track.requester.id}`).setEmoji('📜').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`shuffle_${track.requester.id}`).setEmoji('🔀').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`loop_${track.requester.id}`).setEmoji('🔁').setStyle(ButtonStyle.Secondary)
                    );

                    components = [buttonsRow, buttonsRow2];

                    await interaction.editReply({ components: components });
                }
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