const Especialidad = require('../modelos/especialidad');

// Listar todas las especialidades
async function listarEspecialidades(req, res) {
  try {
    const especialidades = await Especialidad.getEspecialidades();
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener especialidades' });
  }
}

// Obtener una especialidad por ID
async function obtenerEspecialidad(req, res) {
  try {
    const especialidad = await Especialidad.getEspecialidadById(req.params.id);
    if (!especialidad) return res.status(404).json({ error: 'Especialidad no encontrada' });
    res.json(especialidad);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener especialidad' });
  }
}

// Crear una nueva especialidad
async function crearEspecialidad(req, res) {
  try {
    await Especialidad.createEspecialidad(req.body);
    res.status(201).json({ mensaje: 'Especialidad creada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear especialidad' });
  }
}

// Actualizar una especialidad
async function actualizarEspecialidad(req, res) {
  try {
    await Especialidad.updateEspecialidad(req.params.id, req.body);
    res.json({ mensaje: 'Especialidad actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar especialidad' });
  }
}

// Eliminar una especialidad
async function eliminarEspecialidad(req, res) {
  try {
    await Especialidad.deleteEspecialidad(req.params.id);
    res.json({ mensaje: 'Especialidad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar especialidad' });
  }
}

module.exports = {
  listarEspecialidades,
  obtenerEspecialidad,
  crearEspecialidad,
  actualizarEspecialidad,
  eliminarEspecialidad
};
