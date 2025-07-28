const { sql, poolPromise } = require('../config/database');

// Obtener todos los horarios
async function getHorarios() {
  try {
    const pool = await poolPromise;
    let result = await pool.request().query('SELECT * FROM C_Horarios');
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

// Obtener un horario por ID
async function getHorarioById(id_horario) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_horario', sql.Int, id_horario)
      .query('SELECT * FROM C_Horarios WHERE id_horario = @id_horario');
    return result.recordset[0];
  } catch (err) {
    throw err;
  }
}

// Crear un nuevo horario
async function createHorario(data) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('hora_inicio', sql.Time, data.hora_inicio)
      .input('hora_fin', sql.Time, data.hora_fin)
      .query('INSERT INTO C_Horarios (hora_inicio, hora_fin) VALUES (@hora_inicio, @hora_fin)');
    return result;
  } catch (err) {
    throw err;
  }
}

// Actualizar un horario
async function updateHorario(id_horario, data) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_horario', sql.Int, id_horario)
      .input('hora_inicio', sql.Time, data.hora_inicio)
      .input('hora_fin', sql.Time, data.hora_fin)
      .query('UPDATE C_Horarios SET hora_inicio = @hora_inicio, hora_fin = @hora_fin WHERE id_horario = @id_horario');
    return result;
  } catch (err) {
    throw err;
  }
}

// Eliminar un horario
async function deleteHorario(id_horario) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_horario', sql.Int, id_horario)
      .query('DELETE FROM C_Horarios WHERE id_horario = @id_horario');
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getHorarios,
  getHorarioById,
  createHorario,
  updateHorario,
  deleteHorario
};
