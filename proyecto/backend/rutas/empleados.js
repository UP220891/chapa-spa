const express = require('express');
const router = express.Router();
const { verificarToken } = require('./auth');
const { body } = require('express-validator');
const empleadosController = require('../controladores/empleados');

// Proteger todas las rutas de empleados
router.use(verificarToken);

// Listar todos los empleados
router.get('/', empleadosController.listarEmpleados);

// Obtener un empleado por ID
router.get('/:id', empleadosController.obtenerEmpleado);

// Crear un nuevo empleado
router.post('/', [
  body('nombre_empleado').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('El correo debe ser válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
  body('id_especialidad').isInt().withMessage('La especialidad debe ser válida'),
], empleadosController.crearEmpleado);

// Actualizar un empleado
router.put('/:id', [
  body('nombre_empleado').optional().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').optional().isEmail().withMessage('El correo debe ser válido'),
  body('telefono').optional().notEmpty().withMessage('El teléfono es obligatorio'),
  body('fecha_registro').optional().isISO8601().withMessage('La fecha de registro debe ser válida'),
], empleadosController.actualizarEmpleado);

// Eliminar un empleado
router.delete('/:id', empleadosController.eliminarEmpleado);

module.exports = router;
