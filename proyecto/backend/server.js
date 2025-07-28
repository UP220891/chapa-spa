const express = require('express');
const { sql, poolPromise } = require('./config/database');
const cors = require('cors'); // Para evitar problemas con el frontend


const empleadosRoutes = require('./rutas/empleados');
const clientesRoutes = require('./rutas/clientes');

const app = express();

// Middlewares

app.use(cors());
app.use(express.json());

// Rutas API REST
app.use('/api/empleados', empleadosRoutes);
app.use('/api/clientes', clientesRoutes);


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