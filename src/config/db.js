const { Pool } = require('pg');

const pool = new Pool({
  user: 'test_user',
  host: '192.168.40.101',
  database: 'test',
  password: 'password',
  port: 5432,
});

pool.on('connect', (client) => {
  client.query('SET search_path TO test_nodejs');
});

module.exports = pool;