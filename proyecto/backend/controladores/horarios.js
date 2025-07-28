const Horarios = require('../modelos/horarios');

// Listar todos los horarios
async function listarHorarios(req, res) {
  try {
    const horarios = await Horarios.getHorarios();
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener horarios' });
  }
}

// Obtener un horario por ID
async function obtenerHorario(req, res) {
  try {
    const horario = await Horarios.getHorarioById(req.params.id);
    if (!horario) return res.status(404).json({ error: 'Horario no encontrado' });
    res.json(horario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener horario' });
  }
}

// Crear un nuevo horario
async function crearHorario(req, res) {
  try {
    await Horarios.createHorario(req.body);
    res.status(201).json({ mensaje: 'Horario creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear horario' });
  }
}

// Actualizar un horario
async function actualizarHorario(req, res) {
  try {
    await Horarios.updateHorario(req.params.id, req.body);
    res.json({ mensaje: 'Horario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar horario' });
  }
}

// Eliminar un horario
async function eliminarHorario(req, res) {
  try {
    await Horarios.deleteHorario(req.params.id);
    res.json({ mensaje: 'Horario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar horario' });
  }
}

module.exports = {
  listarHorarios,
  obtenerHorario,
  crearHorario,
  actualizarHorario,
  eliminarHorario
};
