const { SlashCommandBuilder,EmbedBuilder } = require('@discordjs/builders');
const { createAudioPlayer,createAudioResource,joinVoiceChannel } = require('@discordjs/voice');

require('dotenv').config();

const data = new SlashCommandBuilder()
    .setName('playaudiofile')
    .setDescription('playaudio')
    .addAttachmentOption(option =>
        option.setName("mp3")
            .setDescription("play Audio!")
            .setRequired(true)
    )

module.exports = {
    data,
    async execute({ client, interaction }) {

        var voiceChannel = interaction.member.voice.channel;

        if(!voiceChannel) { return; }

        const userVoice = await interaction.options.getAttachment('mp3');

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();

        const resource = createAudioResource(userVoice.url,{
            inlineVolume:true
        });

        resource.volume.setVolume(50*0.01);

        player.play(resource);

        connection.subscribe(player);

        try {
            await interaction.reply("Playing " + userVoice.name);
        } catch(err) {
            await interaction.channel.send("error:" + err.msg);
        }
    }
}