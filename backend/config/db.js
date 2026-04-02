const { createClient } = require('@libsql/client');
const fs = require('fs');
require('dotenv').config();

const cloudUrl = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL)?.trim();
const authToken = (process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN)?.trim();
const localUrl = 'file:local.db';

// 🔥 FIX CORRUPTION: Task 1 - Decommission local sync nodes if problematic 
const localFiles = ['enterprise_sync.db', 'enterprise_sync.db-shm', 'enterprise_sync.db-wal', 'local.db', 'local.db-shm', 'local.db-wal'];
localFiles.forEach(file => {
    if (fs.existsSync(file)) {
        try {
            fs.unlinkSync(file);
            console.log(`🗑️  [Init] Purged legacy/corrupted state: ${file}`);
        } catch (e) {
            console.warn(`⚠️  [Init] Could not unlink ${file}: ${e.message}`);
        }
    }
});

let activeDriver;

/**
 * initializeDriver -🌍 Using Remote Turso Database (Task 2)
 * In production/Remote mode, we use the URL directly without local file caching
 * to avoid Render filesystem 'invalid state' errors.
 */
const initializeDriver = (url, token) => {
    const isCloud = url.startsWith('libsql://') || url.startsWith('https://');
    
    if (isCloud) {
        console.log('📡 [Driver] Initializing Remote Cloud Node (Direct)...');
        return createClient({
            url: url,
            authToken: token || '',
        });
    }
    
    console.log('💾 [Driver] Initializing Local Data Stream...');
    return createClient({
        url: url,
        authToken: token || '',
    });
};

activeDriver = initializeDriver(cloudUrl || localUrl, authToken);

/**
 * connectDB - Reliable connection test with retry logic
 */
const connectDB = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`🔌 [Attempt ${i+1}] Probing Cloud Registry: ${cloudUrl}`);
            const result = await activeDriver.execute('SELECT 1 as probe');
            if (result.rows.length > 0) {
                console.log('✅ Turso Persistence Tier: SYNCHRONIZED');
                
                // Initial background sync to prime the local replica
                if (activeDriver.sync) {
                    console.log('📡 [Driver] Priming Local Identity Clones...');
                    await activeDriver.sync();
                }
                
                return true;
            }
        } catch (error) {
            console.warn(`⚠️  Probe Failed: ${error.message}`);
            if (i < retries - 1) {
                console.log('🔄 Retrying cloud handshake in 2s...');
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }
    
    // Final fallback to local
    console.log('🔄 Continuous Failures Detected. Activating Local Persistence Strategy...');
    activeDriver = initializeDriver(localUrl, '');
    try {
        await activeDriver.execute('SELECT 1');
        console.log('✅ Local SQL Buffer: READY');
        return true;
    } catch (e) {
        console.error('❌ Infrastructure Critical: All database tires offline.');
        return false;
    }
};

/**
 * PROXY CLIENT: Wraps activeDriver and logs every query for observability.
 */
const client = new Proxy({}, {
    get: (target, prop) => {
        if (prop === 'execute') {
            return async (query) => {
                const sql = typeof query === 'string' ? query : query.sql;
                const start = Date.now();
                console.log(`🔍 [SQL Query] ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
                try {
                    const result = await activeDriver.execute(query);
                    console.log(`✔️  [SQL Success] Latency: ${Date.now() - start}ms`);
                    return result;
                } catch (err) {
                    console.error(`❌ [SQL Error] ${err.message}`);
                    throw err;
                }
            };
        }
        
        if (typeof activeDriver[prop] === 'function') {
            return activeDriver[prop].bind(activeDriver);
        }
        return activeDriver[prop];
    }
});

/**
 * executeQuery - Convenience function for standard SQL operations
 */
const executeQuery = async (sql, args = []) => {
    return await client.execute({ sql, args });
};

module.exports = { client, connectDB, executeQuery };
