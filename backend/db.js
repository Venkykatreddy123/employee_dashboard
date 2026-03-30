const { client } = require('./config/db');

/**
 * LEGACY EXPORT: Proxy for config/db.js
 * Provided for compatibility with legacy modules still using require('./db') 
 * or require('../db') in the root directory.
 */
module.exports = client;
module.exports.db = client;
