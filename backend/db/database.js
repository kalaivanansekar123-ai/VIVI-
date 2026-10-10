require('dotenv').config();
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'vivimart.db');
const db = new DatabaseSync(dbPath);

// Enable foreign key constraints
db.exec('PRAGMA foreign_keys = ON;');

module.exports = {
  exec: (sql) => db.exec(sql),
  prepare: (sql) => {
    const stmt = db.prepare(sql);
    return {
      run: (...args) => stmt.run(...args),
      get: (...args) => stmt.get(...args),
      all: (...args) => stmt.all(...args)
    };
  },
  transaction: (fn) => {
    return (...args) => {
      db.exec('BEGIN IMMEDIATE TRANSACTION;');
      try {
        const result = fn(...args);
        db.exec('COMMIT;');
        return result;
      } catch (err) {
        db.exec('ROLLBACK;');
        throw err;
      }
    };
  }
};
