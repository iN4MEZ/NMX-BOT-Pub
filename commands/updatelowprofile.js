const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs');

const fetchArtist = require('../utils/fetch-utils');

const data = new SlashCommandBuilder()
    .setName('updatelowprofile')
    .setDescription('update data with low ram')
module.exports = {
    data,
    async execute({ client, interaction }) {

        await updateCreatorData();
        async function updateCreatorData() {
            try {
                creator = await fetchArtist.fetchArtistDataMinimal();
                creator = creator.map(({ name, id, service }) => ({ name, id, service }));

                const total = creator.length;
                const chunkSize = Math.ceil(total / 1);
                let hasWrittenSomething = false;

                const stream = fs.createWriteStream('./assets/data/artists.json', { encoding: 'utf-8' });

                function writeChunk(index = 0) {
                    const isFirst = index === 0;
                    const isLast = index === 9;
                    const chunk = creator.splice(0, chunkSize);
                
                    if (isFirst) stream.write('[');
                
                    let i = 0;
                
                    function writeNextItem() {
                        while (i < chunk.length) {
                            const json = JSON.stringify(chunk[i]);
                            const data = (hasWrittenSomething ? ',' : '') + json;
                
                            const canContinue = stream.write(data);
                            hasWrittenSomething = true;
                            i++;
                
                            if (!canContinue) {
                                // ถ้า stream เต็ม → รอให้ drain ก่อนจะเขียนต่อ
                                stream.once('drain', writeNextItem);
                                return;
                            }
                        }
                
                        global.gc?.();
                
                        if (!isLast) {
                            setImmediate(() => {
                                writeChunk(index + 1);
                            });
                        } else {
                            stream.write(']');
                            stream.end();
                            console.log('✅ Finished writing JSON safely with low memory');
                        }
                    }
                
                    writeNextItem();
                }

                // เริ่มเขียนข้อมูล
                writeChunk();

            } catch (err) {
                console.error("❌ Failed to update creator data:", err);
            }
        }
    }
}