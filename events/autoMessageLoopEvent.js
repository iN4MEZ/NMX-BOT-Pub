const runCommand = require('../utils/run-command').runCommand;

const { setTimeout: sleep } = require('timers/promises');

const globalData = require('../global/data');

module.exports = {
    name: 'ready',
    once: false,
    async execute(client) {
        while (globalData.enableExperimental_AUTOMESSAGE === 1) {
            await runCommand('autodm').then(async () => {

            }).catch(err => console.log(err));
            await sleep(60000);
        }
    },
  };