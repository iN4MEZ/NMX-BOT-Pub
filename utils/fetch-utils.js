const axios = require('axios');

module.exports = {
    async fetchArtistData() {
        try {
            const response = await axios.get('https://kemono.su/api/v1/creators.txt');

            return response.data;
        } catch (error) {
            console.error('Error fetching artist data:', error);
        }
    },
    async fetchArtistDataMinimal() {
        try {
            const response = await axios.get('https://kemono.su/api/v1/creators.txt');
    
            // ดึงเฉพาะ field ที่จำเป็น
            const minimal = response.data.map((artist) => ({
                id: artist.id,
                name: artist.name,
                service: artist.service
            }));
    
            return minimal;
        } catch (error) {
            console.error('Error fetching artist data:', error);
            return [];
        }
    }
    
    
}