const { sql, poolPromise } = require('../config/database');

// Asignar horarios a un empleado (elimina los anteriores y agrega los nuevos)
async function setHorariosEmpleado(id_empleado, id_horarios) {
  const pool = await poolPromise;
  // Eliminar horarios anteriores
  await pool.request()
    .input('id_empleado', sql.Int, id_empleado)
    .query('DELETE FROM T_EmpleadoHorarios WHERE id_empleado = @id_empleado');
  // Insertar los nuevos
  for (const id_horario of id_horarios) {
    await pool.request()
      .input('id_empleado', sql.Int, id_empleado)
      .input('id_horario', sql.Int, id_horario)
      .query('INSERT INTO T_EmpleadoHorarios (id_empleado, id_horario) VALUES (@id_empleado, @id_horario)');
  }
}

// Obtener los ids de horarios de un empleado
async function getHorariosEmpleado(id_empleado) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id_empleado', sql.Int, id_empleado)
    .query('SELECT id_horario FROM T_EmpleadoHorarios WHERE id_empleado = @id_empleado');
  return result.recordset.map(r => r.id_horario);
}

module.exports = {
  setHorariosEmpleado,
  getHorariosEmpleado
};
