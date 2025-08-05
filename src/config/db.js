const { Pool } = require('pg');

// Lấy thông tin kết nối từ biến môi trường
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Đặt schema mặc định cho mỗi kết nối mới
pool.on('connect', (client) => {
  client.query(`SET search_path TO ${process.env.DB_SCHEMA}`);
});

module.exports = pool;
