const express = require('express');
const router = express.Router();
const especialidadController = require('../controladores/especialidad');

router.get('/', especialidadController.listarEspecialidades);
router.get('/:id', especialidadController.obtenerEspecialidad);
router.post('/', especialidadController.crearEspecialidad);
router.put('/:id', especialidadController.actualizarEspecialidad);
router.delete('/:id', especialidadController.eliminarEspecialidad);

module.exports = router;
