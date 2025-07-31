const express = require('express');
const router = express.Router();
const estadoCitaController = require('../controladores/estadocita');
const { body } = require('express-validator');

// Listar todos los estados de cita
router.get('/', estadoCitaController.listarEstadosCita);

// Obtener un estado de cita por ID
router.get('/:id', estadoCitaController.obtenerEstadoCita);

// Crear un nuevo estado de cita
router.post('/', [
  body('nombre_estado').notEmpty().withMessage('El nombre del estado es obligatorio'),
], estadoCitaController.crearEstadoCita);

// Actualizar un estado de cita
router.put('/:id', [
  body('nombre_estado').optional().notEmpty().withMessage('El nombre del estado es obligatorio'),
], estadoCitaController.actualizarEstadoCita);

// Eliminar un estado de cita
router.delete('/:id', estadoCitaController.eliminarEstadoCita);

module.exports = router;
