const Clientes = require('../modelos/clientes');

// Listar todos los clientes
async function listarClientes(req, res) {
  try {
    const clientes = await Clientes.getClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
}

// Obtener un cliente por ID
async function obtenerCliente(req, res) {
  try {
    const cliente = await Clientes.getClienteById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
}

const { validationResult } = require('express-validator');
// Crear un nuevo cliente
async function crearCliente(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  try {
    await Clientes.createCliente(req.body);
    res.status(201).json({ mensaje: 'Cliente creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
}

// Actualizar un cliente
async function actualizarCliente(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  try {
    await Clientes.updateCliente(req.params.id, req.body);
    res.json({ mensaje: 'Cliente actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
}

// Eliminar un cliente
async function eliminarCliente(req, res) {
  try {
    await Clientes.deleteCliente(req.params.id);
    res.json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
}

module.exports = {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};
