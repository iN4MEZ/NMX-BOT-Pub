const { SlashCommandBuilder,EmbedBuilder } = require('@discordjs/builders');
const { useQueue } = require('discord-player');

const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('stop the song')

module.exports = {
    data,
    async execute({ client, interaction }) {
        const queue = useQueue(interaction.guild);
        if (!queue || !queue.isPlaying()) return interaction.editReply({ content: `No music currently playing ${interaction.member}... try again ? ❌`, ephemeral: true });

        queue.delete();

        await interaction.reply("stopped");

        const StoppedEmbed = new EmbedBuilder()
                .setAuthor({ name: "Stop the music" })

            return interaction.channel.send({ embeds: [StoppedEmbed] });
    }
}