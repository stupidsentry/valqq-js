const axios = require('axios');

const API_BASE = process.env.CONFIG_API_URL; // e.g. http://localhost:3000 or your VM IP
const TOKEN = process.env.CONFIG_API_TOKEN;

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`
  };
}

async function load(guildId) {
  try {
    const res = await axios.get(`${API_BASE}/guild/${guildId}/config`, {
      headers: headers()
    });
    return res.data;
  } catch (err) {
    console.warn(`[⚠] Failed to load config for guild ${guildId}: ${err.response?.status || err.message}`);
    return null;
  }
}

async function save(guildId, config) {
  try {
    await axios.put(`${API_BASE}/guild/${guildId}/config`, config, {
      headers: headers()
    });
    return true;
  } catch (err) {
    console.error(`[❌] Failed to save config for guild ${guildId}: ${err.message}`);
    return false;
  }
}

module.exports = { load, save };
