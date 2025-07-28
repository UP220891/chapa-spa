const express = require('express');
const router = express.Router();
const citasController = require('../controladores/citas');

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
