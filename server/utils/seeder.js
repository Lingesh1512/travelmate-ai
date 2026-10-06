const fs = require('fs');
const path = require('path');
const mysql2 = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedDatabase() {
  console.log('🌱 Starting Database Seeding for TravelMate AI...');
  
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT) || 3306;
  const dbName = process.env.DB_NAME || 'travelmate_ai';

  let connection;
  try {
    // Connect without specifying database first to allow database creation
    connection = await mysql2.createConnection({
      host,
      user,
      password,
      port,
      multipleStatements: true
    });

    console.log(`🔌 Connected to MySQL at ${host}:${port}`);

    const sqlFilePath = path.join(__dirname, '../../database/travelmate_ai.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at ${sqlFilePath}`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(`📄 Executing ${path.basename(sqlFilePath)}...`);

    await connection.query(sqlContent);
    console.log('✅ Database schema and seed data loaded successfully!');

    // Verify some tables
    await connection.changeUser({ database: dbName });
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📊 Found ${tables.length} tables in database '${dbName}':`);
    tables.forEach(row => {
      console.log(`   - ${Object.values(row)[0]}`);
    });

    const [userCount] = await connection.query('SELECT COUNT(*) as cnt FROM users');
    const [destCount] = await connection.query('SELECT COUNT(*) as cnt FROM destinations');
    console.log(`👥 Users seeded: ${userCount[0].cnt}`);
    console.log(`🏖️ Destinations seeded: ${destCount[0].cnt}`);
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
