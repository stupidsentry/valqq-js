const fs = require('fs');
const path = require('path');

const SETTINGS_PATH = path.join(__dirname, '../data/guildSettings.json');
let cache = null;

function load() {
  if (!fs.existsSync(SETTINGS_PATH)) {
    cache = {};
    fs.writeFileSync(SETTINGS_PATH, '{}');
  } else if (!cache) {
    cache = JSON.parse(fs.readFileSync(SETTINGS_PATH));
  }
  return cache;
}

function save(data) {
  cache = data;
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
