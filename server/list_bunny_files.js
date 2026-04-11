const axios = require('axios');
require('dotenv').config();

const STORAGE_ZONE_NAME = (process.env.BUNNY_STORAGE_ZONE_NAME || "").trim();
const STORAGE_PASSWORD = (process.env.BUNNY_STORAGE_PASSWORD || "").trim();
const STORAGE_REGION = (process.env.BUNNY_STORAGE_REGION || "").trim();

const STORAGE_BASE_URL = STORAGE_REGION
    ? `https://${STORAGE_REGION}.storage.bunnycdn.com`
    : `https://storage.bunnycdn.com`;

async function listFiles() {
    try {
        console.log(`Listing files for zone: ${STORAGE_ZONE_NAME} at ${STORAGE_BASE_URL}`);
        const response = await axios.get(`${STORAGE_BASE_URL}/${STORAGE_ZONE_NAME}/images/`, {
            headers: {
                AccessKey: STORAGE_PASSWORD
            }
        });
        console.log('FILES_FOUND:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error('Error listing files:', err.response?.status, err.response?.data || err.message);
    }
}

listFiles();
