const express = require('express');
const router = express.Router();
const serviciosController = require('../controladores/servicios');

// Listar todos los servicios
router.get('/', serviciosController.listarServicios);

// Obtener un servicio por ID
router.get('/:id', serviciosController.obtenerServicio);

// Crear un nuevo servicio
router.post('/', serviciosController.crearServicio);

// Actualizar un servicio
router.put('/:id', serviciosController.actualizarServicio);

// Eliminar un servicio
router.delete('/:id', serviciosController.eliminarServicio);

module.exports = router;
