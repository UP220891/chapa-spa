const express = require('express');
const router = express.Router();
const { verificarToken } = require('./auth');
const { body } = require('express-validator');
const citasController = require('../controladores/citas');

// Proteger todas las rutas de citas
router.use(verificarToken);

// Listar todas las citas
router.get('/', citasController.listarCitas);

// Listar citas por cliente
router.get('/cliente/:id_cliente', citasController.listarCitasPorCliente);

// Obtener una cita por ID
router.get('/:id', citasController.obtenerCita);

// Crear una nueva cita
router.post('/', [
  body('id_cliente').isInt().withMessage('El id_cliente debe ser un número entero'),
  body('id_empleado').isInt().withMessage('El id_empleado debe ser un número entero'),
  body('id_servicio').isInt().withMessage('El id_servicio debe ser un número entero'),
  body('fecha').isISO8601().withMessage('La fecha debe ser válida'),
  body('hora').notEmpty().withMessage('La hora es obligatoria'),
], citasController.crearCita);

// Actualizar una cita
router.put('/:id', [
  body('id_cliente').optional().isInt().withMessage('El id_cliente debe ser un número entero'),
  body('id_empleado').optional().isInt().withMessage('El id_empleado debe ser un número entero'),
  body('id_servicio').optional().isInt().withMessage('El id_servicio debe ser un número entero'),
  body('fecha').optional().isISO8601().withMessage('La fecha debe ser válida'),
  body('hora').optional().notEmpty().withMessage('La hora es obligatoria'),
], citasController.actualizarCita);

// Eliminar una cita
router.delete('/:id', citasController.eliminarCita);

module.exports = router;
