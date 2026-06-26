require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seed() {
  const dbName = process.env.DB_NAME || 'worldskill2026_real';

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  console.log(`Resetting database \`${dbName}\`...`);
  await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
  await conn.query(`CREATE DATABASE \`${dbName}\``);
  await conn.query(`USE \`${dbName}\``);

  console.log('Applying schema + seed data from seed_data.sql...');
  const sql = fs.readFileSync(path.join(__dirname, 'seed_data.sql'), 'utf8');
  await conn.query(sql);

  console.log('Seed completed.');
  await conn.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
