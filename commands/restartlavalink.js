const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const globalData = require('../global/data');
const { Riffy } = require('riffy');

const data = new SlashCommandBuilder()
    .setName('restartlavalink')
    .setDescription('Restart the lavalink server')

module.exports = {
    data,
    async execute({ client, interaction }) {

        try {
            await interaction.deferReply();

            const nodes = [
                {
                    host: globalData.host,
                    password: globalData.password,
                    port: globalData.port,
                    secure: globalData.secure,
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

            await interaction.editReply("Lavalink server restarted successfully.");
        } catch (error) {
            console.error("Error restarting Lavalink server:", error);
            await interaction.editReply("Failed to restart the Lavalink server.");
        }



    }
}