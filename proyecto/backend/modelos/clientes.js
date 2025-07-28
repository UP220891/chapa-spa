const sql = require('mssql');
const dbConfig = require('../config/database');

// Obtener todos los clientes
async function getClientes() {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query('SELECT * FROM T_Clientes');
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

// Obtener un cliente por ID
async function getClienteById(id_cliente) {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .query('SELECT * FROM T_Clientes WHERE id_cliente = @id_cliente');
    return result.recordset[0];
  } catch (err) {
    throw err;
  }
}

// Crear un nuevo cliente
async function createCliente(data) {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input('nombre_cliente', sql.VarChar(50), data.nombre_cliente)
      .input('apellido_cliente', sql.VarChar(50), data.apellido_cliente)
      .input('telefono', sql.VarChar(50), data.telefono)
      .input('correo_electronico', sql.NVarChar(50), data.correo_electronico)
      .input('fecha_registro', sql.Date, data.fecha_registro)
      .query('INSERT INTO T_Clientes (nombre_cliente, apellido_cliente, telefono, correo_electronico, fecha_registro) VALUES (@nombre_cliente, @apellido_cliente, @telefono, @correo_electronico, @fecha_registro)');
    return result;
  } catch (err) {
    throw err;
  }
}

// Actualizar un cliente
async function updateCliente(id_cliente, data) {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .input('nombre_cliente', sql.VarChar(50), data.nombre_cliente)
      .input('apellido_cliente', sql.VarChar(50), data.apellido_cliente)
      .input('telefono', sql.VarChar(50), data.telefono)
      .input('correo_electronico', sql.NVarChar(50), data.correo_electronico)
      .input('fecha_registro', sql.Date, data.fecha_registro)
      .query('UPDATE T_Clientes SET nombre_cliente = @nombre_cliente, apellido_cliente = @apellido_cliente, telefono = @telefono, correo_electronico = @correo_electronico, fecha_registro = @fecha_registro WHERE id_cliente = @id_cliente');
    return result;
  } catch (err) {
    throw err;
  }
}

// Eliminar un cliente
async function deleteCliente(id_cliente) {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .query('DELETE FROM T_Clientes WHERE id_cliente = @id_cliente');
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
};
