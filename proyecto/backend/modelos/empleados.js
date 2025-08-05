const { sql, poolPromise } = require('../config/database');

// Obtener todos los empleados
async function getEmpleados() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        e.id_empleado,
        e.nombre_empleado,
        e.id_especialidad,
        e.rol,
        esp.nombre_especialidad
      FROM T_Empleados e
      LEFT JOIN C_Especialidad esp ON e.id_especialidad = esp.id_especialidad
    `);
    
    // Transformar los resultados para incluir el objeto especialidad anidado
    const empleados = result.recordset.map(empleado => ({
      ...empleado,
      especialidad: empleado.nombre_especialidad ? {
        id_especialidad: empleado.id_especialidad,
        nombre_especialidad: empleado.nombre_especialidad
      } : null
    }));
    
    return empleados;
  } catch (err) {
    console.error('Error en getEmpleados:', err);
    throw err;
  }
}

// Obtener un empleado por ID, incluyendo los datos completos de sus horarios
async function getEmpleadoById(id_empleado) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_empleado', sql.Int, id_empleado)
      .query(`
        SELECT 
          e.id_empleado,
          e.nombre_empleado,
          e.id_especialidad,
          e.rol,
          esp.nombre_especialidad
        FROM T_Empleados e
        LEFT JOIN C_Especialidad esp ON e.id_especialidad = esp.id_especialidad
        WHERE e.id_empleado = @id_empleado
      `);
    
    let empleado = result.recordset[0];
    if (!empleado) return null;
    
    // Transformar para incluir el objeto especialidad anidado
    empleado = {
      ...empleado,
      especialidad: empleado.nombre_especialidad ? {
        id_especialidad: empleado.id_especialidad,
        nombre_especialidad: empleado.nombre_especialidad
      } : null
    };
    
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
    console.error('Error en getEmpleadoById:', err);
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
      .input('email', sql.NVarChar(50), data.email)
      .input('telefono', sql.VarChar(15), data.telefono)
      .input('id_especialidad', sql.Int, data.id_especialidad)
      .input('rol', sql.NVarChar(20), 'empleado') // Todos los empleados tienen rol empleado
      .input('fecha_registro', sql.Date, data.fecha_registro)
      .query(`INSERT INTO T_Empleados (nombre_empleado, email, telefono, id_especialidad, rol, fecha_registro) 
              OUTPUT INSERTED.id_empleado 
              VALUES (@nombre_empleado, @email, @telefono, @id_especialidad, @rol, @fecha_registro)`);
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
