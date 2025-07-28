const express = require('express');
const router = express.Router();
const empleadosController = require('../controladores/empleados');

// Listar todos los empleados
router.get('/', empleadosController.listarEmpleados);

// Obtener un empleado por ID
router.get('/:id', empleadosController.obtenerEmpleado);

// Crear un nuevo empleado
router.post('/', empleadosController.crearEmpleado);

// Actualizar un empleado
router.put('/:id', empleadosController.actualizarEmpleado);

// Eliminar un empleado
router.delete('/:id', empleadosController.eliminarEmpleado);

module.exports = router;
