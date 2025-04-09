require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { GatewayIntentBits, Client, GatewayDispatchEvents } = require('discord.js');

const { setTimeout: sleep } = require('timers/promises');

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
        GatewayIntentBits.GuildVoiceStates
    ]
});


// โหลด Event อัตโนมัติ
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

        // 🔹 ดึงชื่อไฟล์
    const fileNameNoExt = path.parse(filePath).name;     // เช่น 'ready'

    console.log(`Loaded event file: ${fileNameNoExt}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

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

    // auto-run 'rrc' command
    async function autoRunLoop() {
        while (globalData.enableRRCLoop == 1) {
            autoRunCommand();
            await sleep(globalData.autoRandomRoleDelay);
        }
    }

    await autoRunLoop();
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

        const channel = await client.channels.fetch('1358228500737298584');
        if (!channel) return;

        await command.execute({ client, interaction: null });

        if (globalData.enableLog === 1) {
            const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
            await channel.send(`Automatic Randomize Role ${now.toUTCString()} Delay: ${globalData.autoRandomRoleDelay}`);
        }
    } catch (err) {
        console.error("❌ Auto command error:", err);
    }
}

client.on('interactionCreate', async (interaction) => {
    try {

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

// This will update the voice state of the player.
client.on("raw", (d) => {
    if (
        ![
            GatewayDispatchEvents.VoiceStateUpdate,
            GatewayDispatchEvents.VoiceServerUpdate,
        ].includes(d.t)
    )
        return;
    client.riffy.updateVoiceState(d);
});

client.on('error', (e) => console.error("Client Error:", e));

const express = require("express");
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});
app.listen(port, () => {
    console.log(`🔗 Listening : http://localhost:${port}`);
});

client.login(process.env.TOKEN);

module.exports = {
    client,commands
}
