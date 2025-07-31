const EstadoCita = require('../modelos/estadocita');
const { validationResult } = require('express-validator');

// Listar todos los estados de cita
async function listarEstadosCita(req, res) {
  try {
    const estados = await EstadoCita.getEstadosCita();
    res.json(estados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estados de cita' });
  }
}

// Obtener un estado de cita por ID
async function obtenerEstadoCita(req, res) {
  try {
    const estado = await EstadoCita.getEstadoCitaById(req.params.id);
    if (!estado) return res.status(404).json({ error: 'Estado de cita no encontrado' });
    res.json(estado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estado de cita' });
  }
}

// Crear un nuevo estado de cita
async function crearEstadoCita(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  try {
    await EstadoCita.createEstadoCita(req.body);
    res.status(201).json({ mensaje: 'Estado de cita creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear estado de cita' });
  }
}

// Actualizar un estado de cita
async function actualizarEstadoCita(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  try {
    await EstadoCita.updateEstadoCita(req.params.id, req.body);
    res.json({ mensaje: 'Estado de cita actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado de cita' });
  }
}

// Eliminar un estado de cita
async function eliminarEstadoCita(req, res) {
  try {
    await EstadoCita.deleteEstadoCita(req.params.id);
    res.json({ mensaje: 'Estado de cita eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar estado de cita' });
  }
}

module.exports = {
  listarEstadosCita,
  obtenerEstadoCita,
  crearEstadoCita,
  actualizarEstadoCita,
  eliminarEstadoCita
};
