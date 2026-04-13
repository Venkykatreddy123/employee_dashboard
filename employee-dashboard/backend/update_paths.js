const fs = require('fs');
const path = require('path');

const folders = ['controllers', 'models'];

folders.forEach(folder => {
    const dir = path.join(__dirname, folder);
    if (!fs.existsSync(dir)) return;
    
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isFile() && file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes("require('../db')")) {
                console.log(`Updating ${filePath}`);
                content = content.replace(/require\('\.\.\/db'\)/g, "require('../config/db')");
                fs.writeFileSync(filePath, content);
            }
        }
    });
});
