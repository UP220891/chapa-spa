const express = require('express');
const router = express.Router();
const { verificarToken } = require('./auth');
const clientesController = require('../controladores/clientes');

// Listar todos los clientes
router.get('/', verificarToken, clientesController.listarClientes);
// Obtener un cliente por ID
router.get('/:id', verificarToken, clientesController.obtenerCliente);
// Crear un nuevo cliente
router.post('/', verificarToken, clientesController.crearCliente);
// Actualizar un cliente
router.put('/:id', verificarToken, clientesController.actualizarCliente);
// Eliminar un cliente
router.delete('/:id', verificarToken, clientesController.eliminarCliente);

module.exports = router;