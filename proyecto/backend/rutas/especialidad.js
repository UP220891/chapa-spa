const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const especialidadController = require('../controladores/especialidad');

router.get('/', especialidadController.listarEspecialidades);
router.get('/:id', especialidadController.obtenerEspecialidad);
router.post('/', [
  body('nombre_especialidad').notEmpty().withMessage('El nombre de la especialidad es obligatorio'),
], especialidadController.crearEspecialidad);
router.put('/:id', [
  body('nombre_especialidad').optional().notEmpty().withMessage('El nombre de la especialidad es obligatorio'),
], especialidadController.actualizarEspecialidad);
router.delete('/:id', especialidadController.eliminarEspecialidad);

module.exports = router;
