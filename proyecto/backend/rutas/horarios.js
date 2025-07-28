const express = require('express');
const router = express.Router();
const horariosController = require('../controladores/horarios');

// Listar todos los horarios
router.get('/', horariosController.listarHorarios);

// Obtener un horario por ID
router.get('/:id', horariosController.obtenerHorario);

// Crear un nuevo horario
router.post('/', horariosController.crearHorario);

// Actualizar un horario
router.put('/:id', horariosController.actualizarHorario);

// Eliminar un horario
router.delete('/:id', horariosController.eliminarHorario);

module.exports = router;
