const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'dulichdb',
  dateStrings: ['DATE', 'DATETIME', 'TIMESTAMP'] 
});


console.log(' Đã kết nối MySQL!');

module.exports = pool;
