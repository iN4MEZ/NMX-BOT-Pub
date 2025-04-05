const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('rrc')
    .setDescription('randomize the role color');

module.exports = {
    data,
    async execute({ client, interaction }) {
        const guild = client.guilds.cache.get('736172193289076816');
        if (!guild) {
            console.log("❌ ไม่พบเซิร์ฟเวอร์");
            return;
        }
    
        // ดึง Role ทั้งหมด
        const roles = guild.roles.cache;
    
        console.log(`🔹 Roles in ${guild.name}:`);
        roles.forEach(role => {
            console.log(`${role.id} - ${role.name}`);
        });
    }
}