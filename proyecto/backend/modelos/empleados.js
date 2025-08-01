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

// Obtener un empleado por ID, incluyendo los datos completos de sus horarios
async function getEmpleadoById(id_empleado) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_empleado', sql.Int, id_empleado)
      .query('SELECT * FROM T_Empleados WHERE id_empleado = @id_empleado');
    const empleado = result.recordset[0];
    if (!empleado) return null;
    // Obtener los id_horarios
    const { getHorariosEmpleado } = require('./empleadohorarios');
    const id_horarios = await getHorariosEmpleado(id_empleado);
    empleado.id_horarios = id_horarios;
    // Obtener los datos completos de los horarios
    if (id_horarios.length > 0) {
      const { getHorarios } = require('./horarios');
      const todosHorarios = await getHorarios();
      empleado.horarios = todosHorarios.filter(h => id_horarios.includes(h.id_horario));
    } else {
      empleado.horarios = [];
    }
    return empleado;
  } catch (err) {
    throw err;
  }
}

// Crear un nuevo empleado
// NOTA: Los horarios ahora se asignan en T_EmpleadoHorarios, no usar id_horario aquí
async function createEmpleado(data) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('nombre_empleado', sql.VarChar(50), data.nombre_empleado)
      .input('id_especialidad', sql.Int, data.id_especialidad)
      .input('rol', sql.NVarChar(20), data.rol || 'empleado')
      .query('INSERT INTO T_Empleados (nombre_empleado, id_especialidad, rol) VALUES (@nombre_empleado, @id_especialidad, @rol)');
    return result;
  } catch (err) {
    throw err;
  }
}

// Actualizar un empleado
// NOTA: Los horarios ahora se asignan en T_EmpleadoHorarios, no usar id_horario aquí
async function updateEmpleado(id_empleado, data) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_empleado', sql.Int, id_empleado)
      .input('nombre_empleado', sql.VarChar(50), data.nombre_empleado)
      .input('id_especialidad', sql.Int, data.id_especialidad)
      .input('rol', sql.NVarChar(20), data.rol || 'empleado')
      .query('UPDATE T_Empleados SET nombre_empleado = @nombre_empleado, id_especialidad = @id_especialidad, rol = @rol WHERE id_empleado = @id_empleado');
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
