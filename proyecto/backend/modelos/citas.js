const sql = require('mssql');
const dbConfig = require('../config/database');

// Obtener todas las citas
async function getCitas() {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query('SELECT * FROM T_Citas');
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

// Obtener una cita por ID
async function getCitaById(id_cita) {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input('id_cita', sql.Int, id_cita)
      .query('SELECT * FROM T_Citas WHERE id_cita = @id_cita');
    return result.recordset[0];
  } catch (err) {
    throw err;
  }
}

// Crear una nueva cita
async function createCita(data) {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input('id_cliente', sql.Int, data.id_cliente)
      .input('id_servicio', sql.Int, data.id_servicio)
      .input('id_empleado', sql.Int, data.id_empleado)
      .input('fecha_cita', sql.Date, data.fecha_cita)
      .input('notas', sql.Text, data.notas || null)
      .input('costo_total', sql.Decimal(8,2), data.costo_total)
      .input('id_estado_cita', sql.Int, data.id_estado_cita || null)
      .input('id_horario', sql.Int, data.id_horario || null)
      .query('INSERT INTO T_Citas (id_cliente, id_servicio, id_empleado, fecha_cita, notas, costo_total, id_estado_cita, id_horario) VALUES (@id_cliente, @id_servicio, @id_empleado, @fecha_cita, @notas, @costo_total, @id_estado_cita, @id_horario)');
    return result;
  } catch (err) {
    throw err;
  }
}

// Actualizar una cita
async function updateCita(id_cita, data) {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input('id_cita', sql.Int, id_cita)
      .input('id_cliente', sql.Int, data.id_cliente)
      .input('id_servicio', sql.Int, data.id_servicio)
      .input('id_empleado', sql.Int, data.id_empleado)
      .input('fecha_cita', sql.Date, data.fecha_cita)
      .input('notas', sql.Text, data.notas || null)
      .input('costo_total', sql.Decimal(8,2), data.costo_total)
      .input('id_estado_cita', sql.Int, data.id_estado_cita || null)
      .input('id_horario', sql.Int, data.id_horario || null)
      .query('UPDATE T_Citas SET id_cliente = @id_cliente, id_servicio = @id_servicio, id_empleado = @id_empleado, fecha_cita = @fecha_cita, notas = @notas, costo_total = @costo_total, id_estado_cita = @id_estado_cita, id_horario = @id_horario WHERE id_cita = @id_cita');
    return result;
  } catch (err) {
    throw err;
  }
}

// Eliminar una cita
async function deleteCita(id_cita) {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input('id_cita', sql.Int, id_cita)
      .query('DELETE FROM T_Citas WHERE id_cita = @id_cita');
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  deleteCita
};
