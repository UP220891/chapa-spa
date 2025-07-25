require('dotenv').config(); // Añade esto al inicio del archivo

const sql = require("mssql");

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true',
    enableArithAbort: true
  },
  port: parseInt(process.env.DB_PORT) || 1433
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("✅ Conexión exitosa a SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ Error al conectar a SQL Server:", err.message);
    process.exit(1); // Detiene la aplicación si hay error
  });

module.exports = { sql, poolPromise };