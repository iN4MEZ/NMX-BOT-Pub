require('dotenv').config();

const { AttachmentBuilder } = require('discord.js');

const axios = require('axios');

const globalData = require('../global/data');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {

        if(globalData.enableCharacterAI_API === 0) {return; }


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
            msgText = message.content.split(" ").slice(1).join(" ");
        }

        // ตรวจสอบว่าแชทนี้ยังคงอยู่หรือไม่
        if (!client.activeChat.includes(`${message.channel.id}_${message.author.id}`)) return;

        // Displays the "YourBotsName is typing.." text in the discord channel.
        message.channel.sendTyping();

        // If no token its not auth'd
        if (!characterAI?.token) await characterAI.authenticate(process.env.CAI_TOKEN); // Authenticate again if the auth has timed out
        const character = await characterAI.fetchCharacter(client.activeCharacter); // Get character by charID

        const dm = await character.DM(); // Get the main conversation of the character;

        const aiReponse = await dm.sendMessage(msgText);

        const ttsMessage = await aiReponse.getTTSUrl(globalData.characterAI_VoiceId);

        const mp3Url = ttsMessage; // แทนด้วย URL ของ mp3 ที่ต้องการส่ง

        await message.reply(aiReponse.content);

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