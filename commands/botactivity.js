const { SlashCommandBuilder } = require('@discordjs/builders');

const { ActivityType, PermissionFlagsBits } = require('discord.js');

const activityTypes = {
    playing: 0,    // ActivityType.Playing
    watching: 3,   // ActivityType.Watching
    listening: 2,  // ActivityType.Listening
    competing: 5   // ActivityType.Competing
};


const activityTypeChoices = Object.keys(activityTypes).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1), // เปลี่ยนเป็นตัวพิมพ์ใหญ่ เช่น "Playing"
    value: key // จะส่งค่า "playing" เป็นต้น
}));

const data = new SlashCommandBuilder()
    .setName('setbotactivity')
    .setDescription('activity')
    .addStringOption(option =>
        option.setName('type')
            .setDescription('Type: avatar or banner')
            .setRequired(true)
            .addChoices(
                activityTypeChoices
            )
    )
    .addStringOption(option =>
        option.setName('text')
            .setDescription('Activity text (e.g., Minecraft)')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

module.exports = {
    data,
    async execute({ client, interaction }) {
        const typeKey = interaction.options.getString('type'); // e.g., 'playing'
        const text = interaction.options.getString('text');

        const type = activityTypes[typeKey];

        try {
            await interaction.client.user.setPresence({
                activities: [{ name: text, type }],
                status: 'online'
            });
    
            await interaction.reply(`✅ ตั้งสถานะเป็น **${typeKey.toUpperCase()}** ${text}`);
        } catch (err) {
            console.log(err);
        }
    }
}