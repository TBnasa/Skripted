const fs = require('fs');
const path = require('path');

const VAULT_PATH = path.join(process.cwd(), 'Skripted-Vault');

function countFiles(dir) {
    let count = 0;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (item === '.obsidian' || item === '.DS_Store' || item === 'GEMINI.md') continue;
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            count += countFiles(fullPath);
        } else {
            count++;
        }
    }
    return count;
}

function main() {
    if (!fs.existsSync(VAULT_PATH)) {
        console.error(`Error: Vault not found at ${VAULT_PATH}`);
        process.exit(1);
    }

    const paraFolders = [
        '0. Inbox',
        '1. Projects',
        '2. Areas',
        '3. Resources',
        '4. Archive'
    ];

    console.log('Vault Health Report:');
    console.log('-------------------');
    
    let totalFiles = 0;
    for (const folder of paraFolders) {
        const folderPath = path.join(VAULT_PATH, folder);
        if (fs.existsSync(folderPath)) {
            const count = countFiles(folderPath);
            console.log(`${folder.padEnd(15)}: ${count} files`);
            totalFiles += count;
        } else {
            console.log(`${folder.padEnd(15)}: [MISSING]`);
        }
    }
    
    console.log('-------------------');
    console.log(`Total Files in PARA: ${totalFiles}`);
}

main();
