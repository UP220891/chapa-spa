const express = require('express');
const router = express.Router();
const { verificarToken } = require('./auth');
const { body } = require('express-validator');
const clientesController = require('../controladores/clientes');

// Listar todos los clientes
router.get('/', verificarToken, clientesController.listarClientes);
// Obtener un cliente por ID
router.get('/:id', verificarToken, clientesController.obtenerCliente);
// Crear un nuevo cliente
router.post('/', verificarToken, [
  body('nombre_cliente').notEmpty().withMessage('El nombre es obligatorio'),
  body('correo_electronico').isEmail().withMessage('El correo debe ser válido'),
  body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
  body('fecha_nacimiento').isISO8601().withMessage('La fecha de nacimiento debe ser válida'),
], clientesController.crearCliente);
// Actualizar un cliente
router.put('/:id', verificarToken, [
  body('nombre_cliente').optional().notEmpty().withMessage('El nombre es obligatorio'),
  body('correo_electronico').optional().isEmail().withMessage('El correo debe ser válido'),
  body('telefono').optional().notEmpty().withMessage('El teléfono es obligatorio'),
  body('fecha_nacimiento').optional().isISO8601().withMessage('La fecha de nacimiento debe ser válida'),
], clientesController.actualizarCliente);
// Eliminar un cliente
router.delete('/:id', verificarToken, clientesController.eliminarCliente);

module.exports = router;