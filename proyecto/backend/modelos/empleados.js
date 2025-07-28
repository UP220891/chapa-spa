const { sql, poolPromise } = require('../config/database');

// Obtener todos los empleados
async function getEmpleados() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM T_Empleados');
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

// Obtener un empleado por ID
async function getEmpleadoById(id_empleado) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_empleado', sql.Int, id_empleado)
      .query('SELECT * FROM T_Empleados WHERE id_empleado = @id_empleado');
    return result.recordset[0];
  } catch (err) {
    throw err;
  }
}

// Crear un nuevo empleado
async function createEmpleado(data) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('nombre_empleado', sql.VarChar(50), data.nombre_empleado)
      .input('id_especialidad', sql.Int, data.id_especialidad)
      .input('id_horario', sql.Int, data.id_horario)
      .query('INSERT INTO T_Empleados (nombre_empleado, id_especialidad, id_horario) VALUES (@nombre_empleado, @id_especialidad, @id_horario)');
    return result;
  } catch (err) {
    throw err;
  }
}

// Actualizar un empleado
async function updateEmpleado(id_empleado, data) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_empleado', sql.Int, id_empleado)
      .input('nombre_empleado', sql.VarChar(50), data.nombre_empleado)
      .input('id_especialidad', sql.Int, data.id_especialidad)
      .input('id_horario', sql.Int, data.id_horario)
      .query('UPDATE T_Empleados SET nombre_empleado = @nombre_empleado, id_especialidad = @id_especialidad, id_horario = @id_horario WHERE id_empleado = @id_empleado');
    return result;
  } catch (err) {
    throw err;
  }
}

// Eliminar un empleado
async function deleteEmpleado(id_empleado) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_empleado', sql.Int, id_empleado)
      .query('DELETE FROM T_Empleados WHERE id_empleado = @id_empleado');
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado
};
