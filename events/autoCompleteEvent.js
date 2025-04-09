const fs = require('fs');
const path = require('node:path');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
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

        } catch (err) {
            console.log(err);
        }
    }
};