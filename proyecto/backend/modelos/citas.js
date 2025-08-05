const { sql, poolPromise } = require('../config/database');

// Obtener todas las citas
async function getCitas() {
  try {
    const pool = await poolPromise;
    let result = await pool.request().query(`
      SELECT 
        c.id_cita,
        c.fecha_cita,
        FORMAT(c.fecha_cita, 'HH:mm') AS hora,
        c.notas,
        c.costo_total,
        c.id_estado_cita,
        c.id_horario,
        cli.nombre_cliente,
        cli.apellido_cliente,
        cli.telefono,
        s.nombre_servicio,
        s.precio AS costo_servicio
      FROM T_Citas c
      JOIN T_Clientes cli ON c.id_cliente = cli.id_cliente
      JOIN C_Servicios s ON c.id_servicio = s.id_servicio
    `);
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

// Obtener una cita por ID
async function getCitaById(id_cita) {
  try {
    const pool = await poolPromise;
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
    const pool = await poolPromise;
    // Combinar fecha y hora en formato DATETIME (sin ':00' extra)
    const fechaHora = `${data.fecha}T${data.hora}`;
    let result = await pool.request()
      .input('id_cliente', sql.Int, data.id_cliente)
      .input('id_servicio', sql.Int, data.id_servicio)
      .input('id_empleado', sql.Int, data.id_empleado)
      .input('fecha_cita', sql.DateTime, fechaHora)
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
    console.log('updateCita - ID:', id_cita, 'Data:', data);
    const pool = await poolPromise;
    
    // Construir la consulta dinámicamente solo con los campos que se envían
    let setClauses = [];
    let request = pool.request().input('id_cita', sql.Int, id_cita);
    
    if (data.id_cliente !== undefined) {
      setClauses.push('id_cliente = @id_cliente');
      request.input('id_cliente', sql.Int, data.id_cliente);
    }
    
    if (data.id_servicio !== undefined) {
      setClauses.push('id_servicio = @id_servicio');
      request.input('id_servicio', sql.Int, data.id_servicio);
    }
    
    if (data.id_empleado !== undefined) {
      setClauses.push('id_empleado = @id_empleado');
      request.input('id_empleado', sql.Int, data.id_empleado);
    }
    
    if (data.fecha && data.hora) {
      const fechaHora = `${data.fecha}T${data.hora}:00`;
      setClauses.push('fecha_cita = @fecha_cita');
      request.input('fecha_cita', sql.DateTime, fechaHora);
    }
    
    if (data.notas !== undefined) {
      setClauses.push('notas = @notas');
      request.input('notas', sql.Text, data.notas || null);
    }
    
    if (data.costo_total !== undefined) {
      setClauses.push('costo_total = @costo_total');
      request.input('costo_total', sql.Decimal(8,2), data.costo_total);
    }
    
    if (data.id_estado_cita !== undefined) {
      setClauses.push('id_estado_cita = @id_estado_cita');
      request.input('id_estado_cita', sql.Int, data.id_estado_cita);
    }
    
    if (data.id_horario !== undefined) {
      setClauses.push('id_horario = @id_horario');
      request.input('id_horario', sql.Int, data.id_horario);
    }
    
    if (setClauses.length === 0) {
      throw new Error('No se proporcionaron campos para actualizar');
    }
    
    const query = `UPDATE T_Citas SET ${setClauses.join(', ')} WHERE id_cita = @id_cita`;
    console.log('Query SQL:', query);
    let result = await request.query(query);
    console.log('Resultado de la actualización:', result);
    return result;
  } catch (err) {
    console.error('Error en updateCita:', err);
    throw err;
  }
}

// Eliminar una cita
async function deleteCita(id_cita) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_cita', sql.Int, id_cita)
      .query('DELETE FROM T_Citas WHERE id_cita = @id_cita');
    return result;
  } catch (err) {
    throw err;
  }
}


// Obtener citas por cliente
async function getCitasPorCliente(id_cliente) {
  try {
    const pool = await poolPromise;
    let result = await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .query(`
        SELECT c.*, s.nombre_servicio, e.nombre_estado as estado_nombre
        FROM T_Citas c
        LEFT JOIN C_Servicios s ON c.id_servicio = s.id_servicio
        LEFT JOIN C_EstadoCita e ON c.id_estado_cita = e.id_estado_cita
        WHERE c.id_cliente = @id_cliente
      `);
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  deleteCita,
  getCitasPorCliente
};
