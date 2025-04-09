const { SlashCommandBuilder } = require('@discordjs/builders');
const globalData = require('../global/data');

const data = new SlashCommandBuilder()
    .setName('setglobalparameter')
    .setDescription('set data')
    .addStringOption(option =>
        option
            .setName('mode')
            .setDescription('what your want to set')
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addStringOption(option =>
        option
            .setName('parameter')
            .setDescription('value')
            .setRequired(true)
    );

module.exports = {
    data,
    async execute({ client, interaction }) {
        const mode = interaction.options.get('mode').value;
        const rawInput = interaction.options.get('parameter').value;

        await interaction.deferReply();

        try {
            if (mode in globalData) {
                // ตรวจสอบชนิดของข้อมูลเดิม
                let convertedValue;
                const currentType = typeof globalData[mode];

                if (currentType === 'number') {
                    // แปลงเป็น int หรือ float ตามความเหมาะสม
                    const numericValue = Number(rawInput);
                    if (!isNaN(numericValue)) {
                        convertedValue = numericValue;
                    } else {
                        throw new Error(`Cannot convert "${rawInput}" to a number`);
                    }
                } else {
                    // แปลงเป็น string (หรืออย่างอื่นถ้ามี)
                    convertedValue = rawInput;
                }

                await interaction.channel.send(`✅ Changed Value Of Mode **${mode}** From **${globalData[mode]}** (${typeof globalData[mode]}) to **${convertedValue}** (${typeof convertedValue})`);

                globalData[mode] = convertedValue;

            } else {
                await interaction.channel.send(`❌ Parameter "${mode}" Not Found`);
            }
        } catch (err) {
            await interaction.channel.send(`❌ An error occurred while changing global data:\n\`${err.message}\``);
        }

        await interaction.editReply({ content: "✅ Done!" });
    }
};
