const { sql, poolPromise } = require('../config/database');

// Obtener todos los estados de cita
async function getEstadosCita() {
  try {
    const pool = await poolPromise;
    let result = await pool.request().query('SELECT * FROM C_EstadoCita');
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

// Obtener un estado de cita por ID
async function getEstadoCitaById(id_estado_cita) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_estado_cita', sql.Int, id_estado_cita)
      .query('SELECT * FROM C_EstadoCita WHERE id_estado_cita = @id_estado_cita');
    return result.recordset[0];
  } catch (err) {
    throw err;
  }
}

// Crear un nuevo estado de cita
async function createEstadoCita(data) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('nombre_estado', sql.VarChar(50), data.nombre_estado)
      .query('INSERT INTO C_EstadoCita (nombre_estado) VALUES (@nombre_estado)');
    return result;
  } catch (err) {
    throw err;
  }
}

// Actualizar un estado de cita
async function updateEstadoCita(id_estado_cita, data) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_estado_cita', sql.Int, id_estado_cita)
      .input('nombre_estado', sql.VarChar(50), data.nombre_estado)
      .query('UPDATE C_EstadoCita SET nombre_estado = @nombre_estado WHERE id_estado_cita = @id_estado_cita');
    return result;
  } catch (err) {
    throw err;
  }
}

// Eliminar un estado de cita
async function deleteEstadoCita(id_estado_cita) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_estado_cita', sql.Int, id_estado_cita)
      .query('DELETE FROM C_EstadoCita WHERE id_estado_cita = @id_estado_cita');
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getEstadosCita,
  getEstadoCitaById,
  createEstadoCita,
  updateEstadoCita,
  deleteEstadoCita
};
