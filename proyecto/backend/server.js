const express = require('express');
const { sql, poolPromise } = require('./config/database');
const cors = require('cors'); // Para evitar problemas con el frontend

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta GET para obtener todas las citas con datos relacionados
app.get('/api/citas', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        c.*, 
        e.nombre_estado, 
        s.nombre_servicio, 
        h.hora_inicio, 
        h.hora_fin
      FROM T_Citas c
      LEFT JOIN EstadoCita e ON c.id_estado_cita = e.id_estado_cita
      LEFT JOIN Servicios s ON c.id_servicio = s.id_servicio
      LEFT JOIN Horarios h ON c.id_horario = h.id_horario
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en GET /api/citas:', err);
    res.status(500).json({ 
      error: 'Error al obtener citas',
      details: err.message 
    });
  }
});

// Ruta POST para crear nueva cita
app.post('/api/citas', async (req, res) => {
  const { 
    id_cliente, 
    id_servicio, 
    id_empleado, 
    fecha_cita, 
    notas, 
    costo_total, 
    id_estado_cita, 
    id_horario 
  } = req.body;

  // Validación de campos obligatorios
  if (!id_cliente || !id_servicio || !id_empleado || !fecha_cita || !costo_total) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios',
      required: ['id_cliente', 'id_servicio', 'id_empleado', 'fecha_cita', 'costo_total']
    });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .input('id_servicio', sql.Int, id_servicio)
      .input('id_empleado', sql.Int, id_empleado)
      .input('fecha_cita', sql.Date, fecha_cita)
      .input('notas', sql.Text, notas || null)
      .input('costo_total', sql.Decimal(8, 2), costo_total)
      .input('id_estado_cita', sql.Int, id_estado_cita || null)
      .input('id_horario', sql.Int, id_horario || null)
      .query(`
        INSERT INTO T_Citas (
          id_cliente, id_servicio, id_empleado, 
          fecha_cita, notas, costo_total, 
          id_estado_cita, id_horario
        ) VALUES (
          @id_cliente, @id_servicio, @id_empleado, 
          @fecha_cita, @notas, @costo_total, 
          @id_estado_cita, @id_horario
        )
      `);
    
    res.status(201).json({ success: true, message: 'Cita creada exitosamente' });
  } catch (err) {
    console.error('Error en POST /api/citas:', err);
    res.status(500).json({ 
      error: 'Error al crear cita',
      details: err.message 
    });
  }
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});