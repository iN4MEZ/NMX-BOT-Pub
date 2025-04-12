require('dotenv').config();

const { AttachmentBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, VoiceConnectionStatus } = require('@discordjs/voice');

const axios = require('axios');

const fs = require('fs');
const path = require('node:path');

const globalData = require('../global/data');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {

        if (globalData.enableCharacterAI_API === 0) { return; }


        // If the code retrieves a message from a bot user, it stops te code. (Remove if you want the bot to interact with other bots)
        if (message.author.bot) return;

        // If the above line is removed, make sure you uncomment the line below! This will make sure the bot doesn't reply on itself.
        // if (message.author.id == client.user.id) return;

        const client = require('../index').client;

        const characterAI = require('../index').characterAI;

        let msgText = message.content;
        if (client.activeChat.length === 0) { // ไม่มีแชทไหนที่กำลังดำเนินอยู่
            if (!message.mentions.users.first()) return;
            if (message.mentions.users.first().id !== client.user.id) return;

            // เริ่มแชทใหม่
            client.activeChat.push(`${message.channel.id}_${message.author.id}`);
            const args = message.content.split(" ").slice(1);
            const filteredArgs = args.filter(arg => !arg.startsWith("<@") && !arg.startsWith("<@!"));
            msgText = filteredArgs.join(" ");
        }

        // ตรวจสอบว่าแชทนี้ยังคงอยู่หรือไม่
        if (!client.activeChat.includes(`${message.channel.id}_${message.author.id}`)) return;

        // Displays the "YourBotsName is typing.." text in the discord channel.
        message.channel.sendTyping();

        // If no token its not auth'd
        if (!characterAI?.token) await characterAI.authenticate(process.env.CAI_TOKEN); // Authenticate again if the auth has timed out
        const character = await characterAI.fetchCharacter(globalData.characterAI_id); // Get character by charID

        const dm = await character.DM(); // Get the main conversation of the character;

        const voiceChannel = message.member?.voice?.channel;

        const aiReponse = await dm.sendMessage(msgText);

        await message.reply(aiReponse.content);

        const ttsMessage = await aiReponse.getTTSUrl(globalData.characterAI_VoiceId);

        const mp3Url = ttsMessage; // แทนด้วย URL ของ mp3 ที่ต้องการส่ง

        const guildId = message.guild.id;

        if (globalData.enableCharacterAI_Voice_TTS === 1) {
            const queues = new Map(); // ใช้เก็บคิวตาม guild

            // ถ้ายังไม่มีคิวของ guild นี้ ให้สร้างใหม่
            if (!queues.has(guildId)) {
                queues.set(guildId, {
                    queue: [],
                    playing: false,
                    connection: null,
                    player: createAudioPlayer(),
                });
            }

            const queueObj = queues.get(guildId);
            queueObj.queue.push({ url: mp3Url, voiceChannel });

            // เข้าห้องเสียงถ้ายังไม่ได้เข้าหรือโดนตัด
            if (
                !queueObj.connection ||
                queueObj.connection.state.status === VoiceConnectionStatus.Destroyed
            ) {
                queueObj.connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                });

                try {
                    await entersState(queueObj.connection, VoiceConnectionStatus.Ready, 10_000);
                    queueObj.connection.subscribe(queueObj.player);
                } catch (err) {
                    console.error('❌ Failed to connect to voice channel:', err);
                    return;
                }
            }

            if (!queueObj.playing) {
                playNextInQueue(guildId, message);
            }

            async function playNextInQueue(guildId) {
                const queueObj = queues.get(guildId);
                const next = queueObj.queue.shift();

                if (!next) {
                    // ไม่มีเพลงตอนนี้ แต่ยังไม่ destroy connection
                    queueObj.playing = false;
                    return;
                }

                queueObj.playing = true;

                try {
                    // ดาวน์โหลดไฟล์
                    const response = await axios.get(next.url, { responseType: 'stream' });
                    const filePath = path.join(__dirname, `${guildId}_temp.mp3`);
                    const writer = fs.createWriteStream(filePath);

                    // use axios to write stream
                    response.data.pipe(writer);
                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                    // create audio reasources
                    const resource = createAudioResource(filePath);
                    queueObj.player.play(resource);

                    queueObj.player.once(AudioPlayerStatus.Idle, () => {
                        fs.unlink(filePath, () => { });
                        playNextInQueue(guildId); // เล่นเพลงถัดไป
                    });

                } catch (err) {
                    console.error('❌ Error playing file:', err);
                    queueObj.playing = false;
                    playNextInQueue(guildId); // ข้ามเพลงที่ error แล้วไปต่อ
                }
            }
        }

        if (globalData.enableCharacterAI_Message_TTS === 0) { return; }

        try {
            const response = await axios.get(mp3Url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            const attachment = new AttachmentBuilder(buffer, { name: 'audio.mp3' });
            await message.channel.send({ files: [attachment] });
        } catch (error) {
            console.error('Error downloading mp3:', error);
            await message.reply('ไม่สามารถส่ง mp3 ได้');
        }

    },
};