const fs = require('fs');
const path = './services/geminiService.ts';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/process\.env\.API_KEY/g, 'process.env.GEMINI_API_KEY');
fs.writeFileSync(path, content);
console.log('Done');
