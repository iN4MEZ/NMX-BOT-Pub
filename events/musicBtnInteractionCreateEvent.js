const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            if (!interaction.isButton()) return;

            const commands = require('../index').commands;

            const command = commands.find(cmd => cmd.data.name === "music");
            if (!command) return; // Exit if no command found

            const parts = interaction.customId.split('_');
            const userId = parts.pop();
            const action = parts.join('_');

            if (interaction.user.id !== userId) {
                return;
            }

            const player = client.riffy.players.get(interaction.guild.id);

            if (!player) return;

            await interaction.deferReply({ flags : 64 });
            

            switch (action) {
                case 'volume_up':
                    player.setVolume(Math.min(player.volume + 10, 100));
                    await interaction.editReply('🔊 Volume increased!');
                    break;

                case 'volume_down':
                    player.setVolume(Math.max(player.volume - 10, 0));
                    await interaction.editReply('🔉 Volume decreased!');
                    break;

                case 'pause':
                    player.pause(true);
                    await interaction.editReply('⏸️ Player paused.');
                    break;

                case 'resume':
                    player.pause(false);
                    await interaction.editReply('▶️ Player resumed.');
                    break;

                case 'skip':
                    player.stop();
                    await interaction.editReply('⏭️ Skipped to the next track.');
                    break;

                case 'stop': {
                    const channel = client.channels.cache.get(player.textChannel);
                    if (player.currentMessageId) {
                        try {
                            const finalMessage = await channel.messages.fetch(player.currentMessageId);
                            if (finalMessage) await finalMessage.delete();
                        } catch (deleteErr) {
                            try {
                                const finalMessage = await channel.messages.fetch(player.currentMessageId);
                                if (finalMessage) {
                                    const disabledComponents = finalMessage.components.map(row =>
                                        new ActionRowBuilder().addComponents(
                                            row.components.map(component =>
                                                ButtonBuilder.from(component).setDisabled(true)
                                            )
                                        )
                                    );
                                    await finalMessage.edit({ components: disabledComponents });
                                }
                            } catch (editErr) {
                                console.error("Failed to disable buttons:", editErr);
                            }
                        }
                    }
                    player.destroy();
                    await interaction.editReply('⏹️ Stopped the music and disconnected.');
                    break;
                }

                case 'clear_queue':
                    player.queue.clear();
                    await interaction.editReply('🗑️ Queue cleared.');
                    break;

                case 'shuffle':
                    player.queue.shuffle();
                    await interaction.editReply('🔀 Queue shuffled!');
                    break;

                case 'loop':
                    const loopMode = player.loop === 'none' ? 'track' : player.loop === 'track' ? 'queue' : 'none';
                    player.setLoop(loopMode);
                    await interaction.editReply(`🔁 Loop mode set to: **${loopMode}**.`);
                    break;

                case 'show_queue':
                    if (!player.queue || player.queue.length === 0) {
                        await interaction.editReply('❌ The queue is empty.');
                    } else {
                        const queueStr = player.queue
                            .map((track, i) => `${i + 1}. **${track.info.title}**`)
                            .join('\n');
                        await interaction.editReply(`🎶 **Queue:**\n${queueStr}`);
                    }
                    break;

                default:
                    await interaction.editReply('❌ Unknown action.');
                    break;
            }

        } catch (err) {
            console.log(err);
        }
    }
};