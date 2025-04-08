require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { GatewayIntentBits, Client, GatewayDispatchEvents } = require('discord.js');

const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');

const { Riffy } = require('riffy');

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

client.distube = new DisTube(client, {
    plugins: [
        new YtDlpPlugin(),
    ],
});

console.log('\x1b[35m[ MUSIC 1 ]\x1b[0m', '\x1b[32mDisTube Music System Active ✅\x1b[0m');

const nodes = [
    {
        host: "ind1.zapto.org",
        password: "yourpasswordhere",
        port: 25575,
        secure: false
    }
];

client.riffy = new Riffy(client, nodes, {
    send: (payload) => {
        const guild = client.guilds.cache.get(payload.d.guild_id);
        if (guild) guild.shard.send(payload);
    },
    defaultSearchPlatform: "ytmsearch",
    restVersion: "v4", // Or "v3" based on your Lavalink version.
});

client.on("ready", () => {
    client.riffy.init(client.user.id);
    console.log(`riffy was init!`);
});

client.riffy.on('nodeConnect', (node) => {
    console.log(`\x1b[34m[ LAVALINK CONNECTION ]\x1b[0m Node connected: \x1b[32m${node.name}\x1b[0m`);
});

client.riffy.on('nodeError', (node, error) => {
    console.error(`\x1b[31m[ LAVALINK ]\x1b[0m Node \x1b[32m${node.name}\x1b[0m had an error: \x1b[33m${error.message}\x1b[0m`);
});

// โหลด Event อัตโนมัติ
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
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

            return interaction.respond(results).catch(() => { });
        }

        if (interaction.isAutocomplete() && interaction.commandName === "setglobalparameter") {
            const focused = interaction.options.getFocused()?.toLowerCase() || '';

            const mode = {
                modeList: Object.keys(globalData)
            }

            const filtered = mode.modeList.filter(target =>
                target.toLowerCase().startsWith(focused)
            ).slice(0, mode.modeList.length);


            const results = filtered.map(mode => ({
                name: `${mode}`,
                value: mode
            }));

            return interaction.respond(results).catch(() => { });
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

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const command = commands.find(cmd => cmd.data.name === "music");
    if (!command) return; // Exit if no command found

    const player = client.riffy.players.get(interaction.guild.id);

    // Handle pause button
    if (interaction.customId === 'pause') {
        if (player) {
            player.paused = !player.paused;
            player.pause(player.paused); // Toggle pause state
            await interaction.reply({
                content: `Music is now ${player.paused ? 'paused' : 'playing'}.`,
                ephemeral: true
            });
        }
    }

    // Handle skip button
    if (interaction.customId === 'skip') {
        if (player) {
            player.stop();
            await interaction.reply({
                content: `Song skipped.`,
                ephemeral: true
            });
        }
    }

    // Handle loop button (can add more functionality later)
    if (interaction.customId === 'loop') {
        await interaction.reply({
            content: `Loop functionality is not implemented yet.`,
            ephemeral: true
        });
    }
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
    client
}
