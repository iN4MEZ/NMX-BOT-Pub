module.exports = {
    async runCommand(commandName) {
        const commands = require('../index').commands;
        const client = require('../index').client;

        return new Promise(async (resolve, reject) => {
            const command = commands.find(cmd => cmd.data.name === commandName);
            if (!command) return reject(new Error("Command not found"));

            try {
                const result = await command.execute({ client, interaction: null });
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
}