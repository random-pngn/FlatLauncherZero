const fs = require('fs');
const datapath = require('./datapath');

function isExistFile(file) {
  try {
    fs.statSync(file);
    return true
  } catch(err) {
    if(err.code === 'ENOENT') return false
  }
}

let temp = JSON.parse(fs.readFileSync(datapath.work + 'data.json', 'utf-8'));
Object.keys(temp).filter(name => !isExistFile(datapath.work + name + "/win/game.exe")).forEach(name => delete temp[name]);
const data = temp;

module.exports = data;
