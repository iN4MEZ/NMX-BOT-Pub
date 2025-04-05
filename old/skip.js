const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const {  useQueue } = require('discord-player');

const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('skip music')

module.exports = {
    data,
    async execute({client,interaction}) {

        const queue = useQueue(interaction.guild);

        if (!queue || !queue.isPlaying()) {return ;};

        queue.node.skip();

        await interaction.reply("skipped");

        const SkippedEmbed = new EmbedBuilder()
                .setAuthor({ name: "Skipped the music" })
                .setAuthor({ name: "Now playing " + queue.currentTrack})

            return interaction.channel.send({ embeds: [SkippedEmbed] });
    }
}