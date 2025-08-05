const Clientes = require('../modelos/clientes');
const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('../config/database');

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
    console.log('❌ Errores de validación:', errors.array());
    return res.status(400).json({ errores: errors.array() });
  }
  
  console.log('📝 Datos recibidos para crear cliente:', req.body);
  
  try {
    // Preparar los datos con fecha de registro automática
    const clienteData = {
      ...req.body,
      fecha_registro: new Date().toISOString().split('T')[0] // Fecha actual en formato YYYY-MM-DD
    };
    
    console.log('🔄 Datos procesados para enviar al modelo:', clienteData);
    
    // Crear el cliente primero
    const result = await Clientes.createCliente(clienteData);
    console.log('✅ Cliente creado exitosamente:', result);
    
    // Si se proporcionó una contraseña, crear las credenciales de acceso
    if (req.body.password && result.recordset && result.recordset[0]) {
      const clienteId = result.recordset[0].id_cliente;
      console.log('🔐 Creando credenciales de acceso para cliente ID:', clienteId);
      
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      
      // Insertar en T_Auth
      const pool = await poolPromise;
      await pool.request()
        .input('email', sql.NVarChar(50), req.body.correo_electronico)
        .input('password', sql.NVarChar(255), hashedPassword)
        .input('tipo_usuario', sql.VarChar(20), 'cliente')
        .input('id_cliente', sql.Int, clienteId)
        .input('id_empleado', sql.Int, null)
        .query('INSERT INTO T_Auth (email, password, tipo_usuario, id_cliente, id_empleado) VALUES (@email, @password, @tipo_usuario, @id_cliente, @id_empleado)');
      
      console.log('✅ Credenciales de acceso creadas exitosamente');
    }
    
    res.status(201).json({ mensaje: 'Cliente creado correctamente', result });
  } catch (error) {
    console.error('❌ Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente', detalle: error.message });
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
