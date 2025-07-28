const express = require('express');
const { sql, poolPromise } = require('./config/database');
const cors = require('cors'); // Para evitar problemas con el frontend



const empleadosRoutes = require('./rutas/empleados');
const clientesRoutes = require('./rutas/clientes');
const citasRoutes = require('./rutas/citas');
const serviciosRoutes = require('./rutas/servicios');
const horariosRoutes = require('./rutas/horarios');
const estadoCitaRoutes = require('./rutas/estadocita');
const especialidadRoutes = require('./rutas/especialidad');

const app = express();

// Middlewares

app.use(cors());
app.use(express.json());

// Rutas API REST



app.use('/api/empleados', empleadosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/estadocita', estadoCitaRoutes);
app.use('/api/especialidad', especialidadRoutes);


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