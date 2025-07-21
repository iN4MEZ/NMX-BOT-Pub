const { SlashCommandBuilder } = require('@discordjs/builders');

const globalData = require('../global/data');

const { Riffy } = require('riffy');

const axios = require('axios');

const data = new SlashCommandBuilder()
  .setName('autoconnectlavalink')
  .setDescription('Auto connect to lavalink server');

module.exports = {
  data,
  async execute({ client, interaction }) {

    if (interaction != null) {
      await interaction.deferReply();
    }

    const req = await axios.get(`https://lavalink-list.ajieblogs.eu.org/All`);

    const nodes = req.data.map(node => ({
      unique_id: node['unique-id'],
      host: node.host,
      password: node.password,
      port: node.port,
      secure: node.secure,
    }));

    const statusPromises = nodes.map(async (node) => {
      try {
      const res = await axios.get(`https://lavalink-list-api.ajieblogs.eu.org/${node.unique_id}/badge/Status`);
      const svgOutput = res.data;

      // Extract the status using a regular expression
      const match = svgOutput.match(/>🔴 Offline<|>🟢 Online</);

      if (match) {
        const status = match[0].replace(/[><🔴🟢]/g, '').trim(); // "Offline" or "Online"
        return status === "Online" ? node : null;
      } else {
        console.log("Status not found in SVG");
        return null;
      }
      } catch (err) {
      console.log(err);
      return null;
      }
    });

    const resolvedNodes = await Promise.all(statusPromises);
    const availableNodes = resolvedNodes.filter(node => node !== null);

    if (availableNodes.length === 0) {
      throw new Error("No available Lavalink nodes found.");
    }

    globalData.lavalinknodes = availableNodes[0];

    client.riffy = new Riffy(client, [globalData.lavalinknodes], {
      send: (payload) => {
      const guild = client.guilds.cache.get(payload.d.guild_id);
      if (guild) guild.shard.send(payload);
      },
      defaultSearchPlatform: "ytmsearch",
      restVersion: "v4", // Or "v3" based on your Lavalink version.
    });

    client.riffy.init(client.user.id);
    console.log(`✅ riffy was init!`);

    client.riffy.on('nodeConnect', (node) => {
      console.log(`\x1b[34m[ LAVALINK CONNECTION ]\x1b[0m Node connected: \x1b[32m${node.name}\x1b[0m`);
    });

    client.riffy.on('nodeError', (node, error) => {
      console.error(`\x1b[31m[ LAVALINK ]\x1b[0m Node \x1b[32m${node.name}\x1b[0m had an error: \x1b[33m${error.message}\x1b[0m`);
    });

    console.log("✅ Connected to lavalink server " + globalData.lavalinknodes.host + " successfully!");

    if(interaction != null) {
      await interaction.editReply({
        content: `Connected to lavalink server ${globalData.lavalinknodes.host} successfully!`,
      });
    }
  }

}