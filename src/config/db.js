const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: ['DATE', 'DATETIME', 'TIMESTAMP'] 
});


console.log(' Đã kết nối MySQL!');

module.exports = pool;
