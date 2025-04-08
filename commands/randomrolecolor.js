const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits  }=  require("discord.js");

const globalData = require('../global/data');

require('dotenv').config();

const data = new SlashCommandBuilder()
    .setName('rrc')
    .setDescription('randomize the role color')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

module.exports = {
    data,
    async execute({ client, interaction }) {

        const roleIds = globalData.randomColorRoleIds;

        const uniqueRoleId = globalData.uniqueRoleIds;

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            interaction.channel.send("❌ ไม่พบเซิร์ฟเวอร์");
            return;
        }

        if(interaction != null) {
            await interaction.deferReply();
        }


        // โหลดสมาชิกทั้งหมด
        await await guild.members.fetch()
        const members = guild.members.cache.filter(member => !member.user.bot && member.presence); // คัดเฉพาะสมาชิกที่ไม่ใช่บอท
        if (members.size === 0) {
            interaction.channel.send("❌ ไม่มีสมาชิกในเซิร์ฟเวอร์");
            return;
        }

        // ฟังก์ชันสุ่มและจัดการ Role
        const assignRandomRoles = async () => {
            for (const roleId of uniqueRoleId) {
                const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(roleId));
                for (const member of membersWithRole.values()) {
                    await member.roles.remove(roleId);
                    //interaction.channel.send(`🗑️ ลบ Role ${interaction.guild.roles.cache.get(roleId)} จาก ${member.user.tag}`);
                }
            }
    
            // สุ่ม 10 คนจากสมาชิกทั้งหมด
            let selectedMembers = members.random(members.size);
            if (!Array.isArray(selectedMembers)) {
                selectedMembers = [selectedMembers];
            }
    
            // แจก Role แบบไม่ให้ซ้ำกัน
            for (let i = 0; i < selectedMembers.length; i++) {
                const member = selectedMembers[i];
                const roleToAssign = uniqueRoleId[i % uniqueRoleId.length]; // วนลูป Role เพื่อกระจาย
                await member.roles.add(roleToAssign);
                //interaction.channel.send(`🎉 ให้ Role ${interaction.guild.roles.cache.get(roleToAssign)} กับ ${member.user.tag}`);
            }
        };

        await assignRandomRoles();

        function getBrightColor() {
            const usedColors = new Set();
            let brightness = "";
            let color;
            do {
                color = Math.floor(Math.random() * 16777215); // สุ่มค่าจาก 0x000000 - 0xFFFFFF
                let r = (color >> 16) & 0xFF; // ดึงค่าแดง
                let g = (color >> 8) & 0xFF;  // ดึงค่าเขียว
                let b = color & 0xFF;         // ดึงค่าสีน้ำเงิน

                brightness = (r * 0.299 + g * 0.587 + b * 0.114); // คำนวณค่าความสว่าง
            } while (brightness < 150 || usedColors.has(color.toString(16).padStart(6, '0'))); // เช็คความสว่างและสีซ้ำ

            let hexColor = `#${color.toString(16).padStart(6, '0')}`;
            usedColors.add(hexColor); // เก็บค่าไว้ใน Set เพื่อป้องกันซ้ำ
            return hexColor;
        }
    
        for (const roleId of roleIds) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                const randomColor = Math.floor(Math.random() * 16777215).toString(16); // สุ่มสี HEX
                await role.setColor(`${getBrightColor()}`).catch(console.error);
                //interaction.channel.send(`🎨 เปลี่ยนสี Role: ${role.name} เป็น ${getBrightColor()}`);
            } else {
                interaction.channel.send(`❌ ไม่พบ Role ID: ${roleId}`);
            }
        }

        if(interaction != null) {
            await interaction.editReply({ content: "Success Randomize!"});
        }
        //interaction.reply("Randomize!");
    }
}