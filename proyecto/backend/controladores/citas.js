const Citas = require('../modelos/citas');

// Listar todas las citas
async function listarCitas(req, res) {
  try {
    const citas = await Citas.getCitas();
    res.json(citas);
  } catch (error) {
    console.error('Error en GET /api/citas:', error);
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
  if (!errors.isEmpty())
     {
    return res.status(400).json({ errores: errors.array() });
  }
  try {
    await Citas.createCita(req.body);
    res.status(201).json({ mensaje: 'Cita creada correctamente' });
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ error: 'Error al crear cita', detalle: error.message });
  }
}

// Actualizar una cita
async function actualizarCita(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  try {
    console.log('Actualizando cita ID:', req.params.id);
    console.log('Datos recibidos:', req.body);
    await Citas.updateCita(req.params.id, req.body);
    res.json({ mensaje: 'Cita actualizada correctamente' });
  } catch (error) {
    console.error('Error en actualizarCita:', error);
    res.status(500).json({ error: 'Error al actualizar cita', detalle: error.message });
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

// Listar citas por cliente
async function listarCitasPorCliente(req, res) {
  try {
    const id_cliente = req.params.id_cliente;
    const citas = await Citas.getCitasPorCliente(id_cliente);
    // Si la consulta es exitosa pero no hay citas, devuelve array vacío
    if (!Array.isArray(citas)) {
      console.error('Respuesta inesperada en getCitasPorCliente:', citas);
      return res.json([]);
    }
    res.json(citas);
  } catch (error) {
    // Loguea el error real
    console.error('Error en listarCitasPorCliente:', error);
    // Si el error es por datos, responde array vacío
    if (error && error.message && error.message.includes('null') || error.message.includes('JOIN')) {
      return res.json([]);
    }
    // Si el error es grave (base de datos caída), responde 500
    res.status(500).json({ error: 'Error al obtener citas del cliente', detalle: error.message });
  }
}

module.exports = {
  listarCitas,
  obtenerCita,
  crearCita,
  actualizarCita,
  eliminarCita,
  listarCitasPorCliente
};
