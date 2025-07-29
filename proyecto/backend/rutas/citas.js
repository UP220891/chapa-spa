const express = require('express');
const router = express.Router();
const { verificarToken } = require('./auth');
const citasController = require('../controladores/citas');

// Proteger todas las rutas de citas
router.use(verificarToken);

// Listar todas las citas
router.get('/', citasController.listarCitas);

// Obtener una cita por ID
router.get('/:id', citasController.obtenerCita);

// Crear una nueva cita
router.post('/', citasController.crearCita);

// Actualizar una cita
router.put('/:id', citasController.actualizarCita);

// Eliminar una cita
router.delete('/:id', citasController.eliminarCita);

module.exports = router;
