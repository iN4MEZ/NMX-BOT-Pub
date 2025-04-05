require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { GatewayIntentBits, Client } = require('discord.js');

const fs = require('fs');
const path = require('node:path');

const globalData = require('./global/data');

const commands = [];
const commandsData = [];

let creator = [];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ]
});

// 🔁 Load commands once
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath)) {
    const command = require(path.join(commandsPath, file));
    console.log(`Loaded ${command.data.name} Command`);
    commandsData.push(command.data);
    commands.push(command);
}

client.once('ready', async () => {

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commandsData }
        );

        await autoUpdate();

        console.log("✅ Bot is ready Login with " + client.user.username);

    // auto-run 'rrc' command every 5h
    setInterval(autoRunCommand, globalData.autorandomroleDelay);
    });

async function autoUpdate() {
    const command = commands.find(cmd => cmd.data.name === 'updatelowprofile');
        if (!command) return;

        await command.execute({ client, interaction: null });
}

async function autoRunCommand() {
    try {
        const command = commands.find(cmd => cmd.data.name === 'rrc');
        if (!command) return;

        const channel = await client.channels.fetch('1357120803203715083');
        if (!channel) return;

        await command.execute({ client, interaction: null });

        const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
        await channel.send(`Automatic Randomize Role ${now.toUTCString()} Delay: ${globalData.autorandomroleDelay}`);
    } catch (err) {
        console.error("❌ Auto command error:", err);
    }
}

client.on('interactionCreate', async (interaction) => {
    try {
        // 🎯 Autocomplete
        if (interaction.isAutocomplete() && interaction.commandName === "search") {
            const focused = interaction.options.getFocused()?.toLowerCase() || '';

            const creatorCache = JSON.parse(fs.readFileSync('./assets/data/artists.json'));

            const filtered = creatorCache.filter(artist =>
                artist.name.toLowerCase().startsWith(focused)
            ).slice(0, 10);

            const results = filtered.map(artist => ({
                name: `${artist.name} ${artist.service}`,
                value: artist.id
            }));

            return interaction.respond(results).catch(() => {});
        }

        // ✅ Slash command
        if (interaction.isCommand()) {
            const command = commands.find(cmd => cmd.data.name === interaction.commandName);
            if (command) {
                await command.execute({ client, interaction });
                console.log("⚡ Executed:", interaction.commandName);
            }
        }
    } catch (err) {
        console.error("❌ Interaction error:", err);
    }
});

client.on('error', (e) => console.error("Client Error:", e));
client.login(process.env.TOKEN);
