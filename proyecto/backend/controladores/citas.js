const Citas = require('../modelos/citas');

// Listar todas las citas
async function listarCitas(req, res) {
  try {
    const citas = await Citas.getCitas();
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
}

// Obtener una cita por ID
async function obtenerCita(req, res) {
  try {
    const cita = await Citas.getCitaById(req.params.id);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cita' });
  }
}

const { validationResult } = require('express-validator');
// Crear una nueva cita
async function crearCita(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  try {
    await Citas.createCita(req.body);
    res.status(201).json({ mensaje: 'Cita creada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cita' });
  }
}

// Actualizar una cita
async function actualizarCita(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  try {
    await Citas.updateCita(req.params.id, req.body);
    res.json({ mensaje: 'Cita actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cita' });
  }
}

// Eliminar una cita
async function eliminarCita(req, res) {
  try {
    await Citas.deleteCita(req.params.id);
    res.json({ mensaje: 'Cita eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cita' });
  }
}

module.exports = {
  listarCitas,
  obtenerCita,
  crearCita,
  actualizarCita,
  eliminarCita
};
