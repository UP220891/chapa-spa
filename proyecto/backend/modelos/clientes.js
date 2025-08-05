const { sql, poolPromise } = require('../config/database');

// Obtener todos los clientes
async function getClientes() {
  try {
    const pool = await poolPromise;
    let result = await pool.request().query('SELECT * FROM T_Clientes');
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

// Obtener un cliente por ID
async function getClienteById(id_cliente) {
  try {
    const pool = await poolPromise;
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
    console.log('🔍 Datos que llegan al modelo:', data);
    
    const pool = await poolPromise;
    let result = await pool.request()
      .input('nombre_cliente', sql.VarChar(50), data.nombre_cliente)
      .input('apellido_cliente', sql.VarChar(50), data.apellido_cliente)
      .input('telefono', sql.VarChar(50), data.telefono)
      .input('correo_electronico', sql.NVarChar(50), data.correo_electronico)
      .input('fecha_registro', sql.Date, data.fecha_registro)
      .input('fecha_nacimiento', sql.Date, data.fecha_nacimiento)
      .query('INSERT INTO T_Clientes (nombre_cliente, apellido_cliente, telefono, correo_electronico, fecha_registro, fecha_nacimiento) OUTPUT INSERTED.id_cliente VALUES (@nombre_cliente, @apellido_cliente, @telefono, @correo_electronico, @fecha_registro, @fecha_nacimiento)');
    
    console.log('✅ Resultado de la inserción:', result);
    return result;
  } catch (err) {
    console.error('❌ Error en createCliente:', err);
    throw err;
  }
}

// Actualizar un cliente
async function updateCliente(id_cliente, data) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .input('nombre_cliente', sql.VarChar(50), data.nombre_cliente)
      .input('apellido_cliente', sql.VarChar(50), data.apellido_cliente)
      .input('telefono', sql.VarChar(50), data.telefono)
      .input('correo_electronico', sql.NVarChar(50), data.correo_electronico)
      .input('fecha_registro', sql.Date, data.fecha_registro)
      .input('fecha_nacimiento', sql.Date, data.fecha_nacimiento)
      .query('UPDATE T_Clientes SET nombre_cliente = @nombre_cliente, apellido_cliente = @apellido_cliente, telefono = @telefono, correo_electronico = @correo_electronico, fecha_registro = @fecha_registro, fecha_nacimiento = @fecha_nacimiento WHERE id_cliente = @id_cliente');
    return result;
  } catch (err) {
    throw err;
  }
}

// Eliminar un cliente
async function deleteCliente(id_cliente) {
  try {
    const pool = await poolPromise;
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
