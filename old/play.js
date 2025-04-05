const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { useMainPlayer, QueryType, useQueue } = require('discord-player');
const { ButtonBuilder,ActionRowBuilder,ButtonStyle } = require('discord.js');

const player = useMainPlayer();

const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('play music')
    .addStringOption(option => option.setName("song").setDescription("The song you want to play").setRequired(true))

module.exports = {
    data,
    async execute({ client, interaction }) {

        const query = interaction.options.get('song').value;

        await interaction.reply("playing song...");

        const res = await player.search(query, {
            requestedBy: interaction.member,
        });

        if (!interaction.member.voice.channel) {
            await interaction.reply("Join the channel first motherfucker.");
            return;
        }

        try {
            var queue = await player.nodes.create(interaction.guild, {
                metadata: interaction.channel,
                spotifyBridge: true,
                volume: 50,
                connectionTimeout: 30,
                bufferingTimeout: 30,
            });

            var channelBitrate = interaction.member.voice.channel.bitrate;

            player.options.ytdlOptions.filter = channelBitrate;


        } catch (err) {

            console.log(err.message);

            const queue = useQueue(interaction.guild);
            await queue.delete();

            const NoVoiceEmbed = new EmbedBuilder()
                .setAuthor({ name: "Something Went wrong" })

            return interaction.channel.send({ embeds: [NoVoiceEmbed] });
        }

        await queue.connect(interaction.member.voice.channel);

        if (res.tracks === null) {
            const MusicNotFound = new EmbedBuilder()
                .setAuthor({ name: `Not found the song` })

            return interaction.channel.send({ embeds: [MusicNotFound] });
        }

        res.hasPlaylist() ? queue.addTrack(res.tracks) : queue.addTrack(res.tracks[0]);

        if (!queue.isPlaying()) await queue.node.play();

        const MusicPlayed = new EmbedBuilder()
            .setAuthor({ name: `Playing ${queue.currentTrack} Service ${queue.form}` })

        const pauseBtn = new ButtonBuilder().setCustomId('pause').setLabel("Pause").setStyle(ButtonStyle.Secondary);

        const skipBtn = new ButtonBuilder().setCustomId('skip').setLabel("Skip").setStyle(ButtonStyle.Secondary);

        const loopBtn = new ButtonBuilder().setCustomId('loop').setLabel("Loop").setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
			.addComponents(pauseBtn)
            .addComponents(skipBtn)
            .addComponents(loopBtn);

        return interaction.channel.send({ embeds: [MusicPlayed], components: [row],  });
    }
    
}