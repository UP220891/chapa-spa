const { sql, poolPromise } = require('../config/database');

// Obtener todos los servicios
async function getServicios() {
  try {
    const pool = await poolPromise;
    let result = await pool.request().query('SELECT * FROM C_Servicios');
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

// Obtener un servicio por ID
async function getServicioById(id_servicio) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_servicio', sql.Int, id_servicio)
      .query('SELECT * FROM C_Servicios WHERE id_servicio = @id_servicio');
    return result.recordset[0];
  } catch (err) {
    throw err;
  }
}

// Crear un nuevo servicio
async function createServicio(data) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('nombre_servicio', sql.VarChar(50), data.nombre_servicio)
      .input('descripcion', sql.Text, data.descripcion || null)
      .input('duracion', sql.Int, data.duracion)
      .input('precio', sql.Decimal(8,2), data.precio)
      .input('imagen', sql.Text, data.imagen || null)
      .query('INSERT INTO C_Servicios (nombre_servicio, descripcion, duracion, precio, imagen) VALUES (@nombre_servicio, @descripcion, @duracion, @precio, @imagen)');
    return result;
  } catch (err) {
    throw err;
  }
}

// Actualizar un servicio
async function updateServicio(id_servicio, data) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_servicio', sql.Int, id_servicio)
      .input('nombre_servicio', sql.VarChar(50), data.nombre_servicio)
      .input('descripcion', sql.Text, data.descripcion || null)
      .input('duracion', sql.Int, data.duracion)
      .input('precio', sql.Decimal(8,2), data.precio)
      .query('UPDATE C_Servicios SET nombre_servicio = @nombre_servicio, descripcion = @descripcion, duracion = @duracion, precio = @precio WHERE id_servicio = @id_servicio');
    return result;
  } catch (err) {
    throw err;
  }
}

// Eliminar un servicio
async function deleteServicio(id_servicio) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_servicio', sql.Int, id_servicio)
      .query('DELETE FROM C_Servicios WHERE id_servicio = @id_servicio');
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio
};
