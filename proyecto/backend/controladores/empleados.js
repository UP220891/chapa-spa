const Empleados = require('../modelos/empleados');
const { validationResult } = require('express-validator');

// Listar todos los empleados
async function listarEmpleados(req, res) {
  try {
    const empleados = await Empleados.getEmpleados();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
}

// Obtener un empleado por ID
async function obtenerEmpleado(req, res) {
  try {
    const empleado = await Empleados.getEmpleadoById(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleado' });
  }
}

// Crear un nuevo empleado
async function crearEmpleado(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  try {
    await Empleados.createEmpleado(req.body);
    res.status(201).json({ mensaje: 'Empleado creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear empleado' });
  }
}

// Actualizar un empleado
async function actualizarEmpleado(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  try {
    await Empleados.updateEmpleado(req.params.id, req.body);
    res.json({ mensaje: 'Empleado actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
}

// Eliminar un empleado
async function eliminarEmpleado(req, res) {
  try {
    await Empleados.deleteEmpleado(req.params.id);
    res.json({ mensaje: 'Empleado eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
}

module.exports = {
  listarEmpleados,
  obtenerEmpleado,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado
};
