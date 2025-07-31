const express = require('express');
const router = express.Router();
const horariosController = require('../controladores/horarios');
const { body } = require('express-validator');

// Listar todos los horarios
router.get('/', horariosController.listarHorarios);

// Obtener un horario por ID
router.get('/:id', horariosController.obtenerHorario);

// Crear un nuevo horario
router.post('/', [
  body('id_empleado').isInt().withMessage('El id_empleado debe ser un número entero'),
  body('dia').notEmpty().withMessage('El día es obligatorio'),
  body('hora_inicio').notEmpty().withMessage('La hora de inicio es obligatoria'),
  body('hora_fin').notEmpty().withMessage('La hora de fin es obligatoria'),
], horariosController.crearHorario);

// Actualizar un horario
router.put('/:id', [
  body('id_empleado').optional().isInt().withMessage('El id_empleado debe ser un número entero'),
  body('dia').optional().notEmpty().withMessage('El día es obligatorio'),
  body('hora_inicio').optional().notEmpty().withMessage('La hora de inicio es obligatoria'),
  body('hora_fin').optional().notEmpty().withMessage('La hora de fin es obligatoria'),
], horariosController.actualizarHorario);

// Eliminar un horario
router.delete('/:id', horariosController.eliminarHorario);

module.exports = router;
