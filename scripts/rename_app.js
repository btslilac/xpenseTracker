const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  content = content.replace(/Xpensify AI/g, 'XpenseTracker');
  content = content.replace(/Xpensify/g, 'XpenseTracker');
  content = content.replace(/xpensify\.ai/g, 'xpensetracker.com');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

const appJsonPath = path.join(__dirname, '..', 'app.json');
let appJson = fs.readFileSync(appJsonPath, 'utf8');
appJson = appJson.replace(/"name":\s*"Xpensify AI"/g, '"name": "XpenseTracker"');
fs.writeFileSync(appJsonPath, appJson, 'utf8');
console.log('Updated: app.json');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.sql')) {
        replaceInFile(fullPath);
      }
    }
  }
}

walk(path.join(__dirname, '..', 'src'));
