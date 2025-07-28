const Servicios = require('../modelos/servicios');

// Listar todos los servicios
async function listarServicios(req, res) {
  try {
    const servicios = await Servicios.getServicios();
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
}

// Obtener un servicio por ID
async function obtenerServicio(req, res) {
  try {
    const servicio = await Servicios.getServicioById(req.params.id);
    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener servicio' });
  }
}

// Crear un nuevo servicio
async function crearServicio(req, res) {
  try {
    await Servicios.createServicio(req.body);
    res.status(201).json({ mensaje: 'Servicio creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear servicio' });
  }
}

// Actualizar un servicio
async function actualizarServicio(req, res) {
  try {
    await Servicios.updateServicio(req.params.id, req.body);
    res.json({ mensaje: 'Servicio actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar servicio' });
  }
}

// Eliminar un servicio
async function eliminarServicio(req, res) {
  try {
    await Servicios.deleteServicio(req.params.id);
    res.json({ mensaje: 'Servicio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar servicio' });
  }
}

module.exports = {
  listarServicios,
  obtenerServicio,
  crearServicio,
  actualizarServicio,
  eliminarServicio
};
