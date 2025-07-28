const express = require('express');
const router = express.Router();
const clientesController = require('../controladores/clientes');

// Listar todos los clientes
router.get('/', clientesController.listarClientes);

// Obtener un cliente por ID
router.get('/:id', clientesController.obtenerCliente);

// Crear un nuevo cliente
router.post('/', clientesController.crearCliente);

// Actualizar un cliente
router.put('/:id', clientesController.actualizarCliente);

// Eliminar un cliente
router.delete('/:id', clientesController.eliminarCliente);

module.exports = router;
