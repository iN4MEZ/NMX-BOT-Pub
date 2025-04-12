const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const globalData = require('../global/data');

require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
      .setName("chatbot")
      .setDescription("Config your bot")
      .addSubcommand(subcommand =>
        subcommand
          .setName('newchat')
          .setDescription('Create new DM')
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('clearchat')
          .setDescription('Clear your chat')
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('voicemode')
          .setDescription('voice mode')
      ),
      
  
    async execute(interaction) {
      const sub = interaction.options.getSubcommand();
  
      if (sub === 'newchat') {

        const characterAI = require('../index').characterAI;

        // ตรงนี้คือ logic สำหรับสร้าง new DM
        try {
            if (!characterAI?.token) await characterAI.authenticate(process.env.CAI_TOKEN); // Authenticate again if the auth has timed out
            const character = await characterAI.fetchCharacter(globalData.characterAI_id); // Get character by charID
            
            await character.createDM(false) // Creates a new dm, without the AI replying

            return interaction.reply("Messages have been saved and a new DM has been opened.")
        } catch (error) { // If something goes wrong:
            console.log(error)
            return interaction.reply("Something went wrong, chat has not been cleared.") // Return feedback to the user
        }
      } else if (sub === 'clearchat') {

        

      } else if (sub === 'voicemode') {

      }
    },
  };