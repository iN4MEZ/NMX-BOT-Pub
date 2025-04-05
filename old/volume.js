const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const {  useQueue } = require('discord-player');

const data = new SlashCommandBuilder()
    .setName('volume')
    .setDescription('set Volume')
    .addStringOption(options => options.setName('volume').setDescription('change volume').setRequired(true))

module.exports = {
    data,
    async execute({client,interaction}) {

        const volume = interaction.options.get('volume').value;

        const queue = useQueue(interaction.guild);

        if (!queue || !queue.isPlaying()) {return ;}

        queue.node.setVolume(parseInt(volume));

        await interaction.reply("Set success");

        const SetVolumeEmbed = new EmbedBuilder()
                .setAuthor({ name: "Set volume: "+volume })

            return interaction.channel.send({ embeds: [SetVolumeEmbed] });
    }
}