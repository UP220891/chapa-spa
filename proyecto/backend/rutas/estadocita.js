const express = require('express');
const router = express.Router();
const estadoCitaController = require('../controladores/estadocita');

// Listar todos los estados de cita
router.get('/', estadoCitaController.listarEstadosCita);

// Obtener un estado de cita por ID
router.get('/:id', estadoCitaController.obtenerEstadoCita);

// Crear un nuevo estado de cita
router.post('/', estadoCitaController.crearEstadoCita);

// Actualizar un estado de cita
router.put('/:id', estadoCitaController.actualizarEstadoCita);

// Eliminar un estado de cita
router.delete('/:id', estadoCitaController.eliminarEstadoCita);

module.exports = router;
