const { createClient } = require('@libsql/client');

let dbClient;
try {
  dbClient = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:./local.db',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  });
} catch (err) {
  console.error("❌ Failed to initialize libSQL client:", err.message);
  process.exit(1);
}

// Ensure the DB is definitely reachable before letting the app pretend it's fine.
const verifyConnection = async () => {
  try {
    const isRemote = process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith('libsql://');
    console.log(`⏳ Attempting to connect to ${isRemote ? 'Turso' : 'Local'} database...`);
    await dbClient.execute('SELECT 1;');
    console.log(`✅ ${isRemote ? 'Turso' : 'Local'} Connected Successfully!`);
  } catch (err) {
    console.warn("⚠️ Remote Connection Failed. Falling back to local.db...");
    try {
        dbClient = createClient({ url: 'file:./local.db' });
        await dbClient.execute('SELECT 1;');
        console.log("✅ Local SQLite Fallback Successful!");
    } catch (localErr) {
        console.error("❌ Fatal: Both remote and local DB connections failed:", localErr.message);
        process.exit(1);
    }
  }
};

const executeQuery = async (sql, args = []) => {
  try {
    return await dbClient.execute({ sql, args });
  } catch (err) {
    console.error(`❌ DB Query Error [${sql}]:`, err.message);
    throw err;
  }
};

module.exports = { dbClient, executeQuery, verifyConnection };
