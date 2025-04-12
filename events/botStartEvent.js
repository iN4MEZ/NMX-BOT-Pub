const globalData = require('../global/data');

const { setTimeout: sleep } = require('timers/promises');

const runCommand = require('../utils/run-command').runCommand;

module.exports = {
    name: 'ready',
    once: false,
    async execute(client) {
        
        await runCommand('updatelowprofile');
        
        await autoRunLoop();

        // auto-run 'rrc' command
        async function autoRunLoop() {
            while (globalData.enableRRCLoop == 1) {
                runCommand('rrc').then(async () => {
                    if (globalData.enableLog === 1) {

                        const channel = await client.channels.fetch('1358228500737298584');
                        if (!channel) return;

                        const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
                        await channel.send(`Automatic Randomize Role ${now.toUTCString()} Delay: ${globalData.autoRandomRoleDelay}`);
                    }
                }).catch((err) => console.log('❌ Random role color error: ' + err));
                await sleep(globalData.autoRandomRoleDelay);
            }
        }
    },
};