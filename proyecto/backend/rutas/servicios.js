const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const serviciosController = require('../controladores/servicios');

// Listar todos los servicios
router.get('/', serviciosController.listarServicios);

// Obtener un servicio por ID
router.get('/:id', serviciosController.obtenerServicio);

// Crear un nuevo servicio
router.post('/', [
  body('nombre_servicio').notEmpty().withMessage('El nombre del servicio es obligatorio'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
], serviciosController.crearServicio);

// Actualizar un servicio
router.put('/:id', [
  body('nombre_servicio').optional().notEmpty().withMessage('El nombre del servicio es obligatorio'),
  body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
], serviciosController.actualizarServicio);

// Eliminar un servicio
router.delete('/:id', serviciosController.eliminarServicio);

module.exports = router;
