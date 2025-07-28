const sql = require('mssql');
const dbConfig = require('../config/database');

// Obtener todas las especialidades
async function getEspecialidades() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM C_Especialidad');
    return result.recordset;
  } catch (error) {
    throw error;
  }
}

// Obtener una especialidad por ID
async function getEspecialidadById(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM C_Especialidad WHERE id_especialidad = @id');
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
}

// Crear una nueva especialidad
async function createEspecialidad(data) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('nombre', sql.VarChar(50), data.nombre_especialidad)
      .query('INSERT INTO C_Especialidad (nombre_especialidad) VALUES (@nombre)');
  } catch (error) {
    throw error;
  }
}

// Actualizar una especialidad
async function updateEspecialidad(id, data) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar(50), data.nombre_especialidad)
      .query('UPDATE C_Especialidad SET nombre_especialidad = @nombre WHERE id_especialidad = @id');
  } catch (error) {
    throw error;
  }
}

// Eliminar una especialidad
async function deleteEspecialidad(id) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM C_Especialidad WHERE id_especialidad = @id');
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getEspecialidades,
  getEspecialidadById,
  createEspecialidad,
  updateEspecialidad,
  deleteEspecialidad
};
