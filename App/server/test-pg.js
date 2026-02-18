const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    user: 'nonexistent_user',
    host: '127.0.0.1',
    database: 'myproject',
    port: 5433,
    password: 'password', // Explicit password
});

async function main() {
    try {
        console.log('Connecting...');
        await client.connect();
        console.log('Connected!');
        await client.end();
    } catch (err) {
        fs.writeFileSync('error.log', err.toString() + '\\n' + err.stack);
        console.error('Connection error logged to error.log');
    }
}

main();
