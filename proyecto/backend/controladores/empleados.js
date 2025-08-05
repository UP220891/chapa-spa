const Empleados = require('../modelos/empleados');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { sql, poolPromise } = require('../config/database');

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
    console.log('❌ Errores de validación:', errors.array());
    return res.status(400).json({ errores: errors.array() });
  }
  
  console.log('📝 Datos recibidos para crear empleado:', req.body);
  console.log('🔍 Validaciones pasadas, procesando empleado...');
  
  try {
    // Preparar los datos con fecha de registro automática
    const empleadoData = {
      ...req.body,
      fecha_registro: new Date().toISOString().split('T')[0] // Fecha actual en formato YYYY-MM-DD
    };
    
    console.log('🔄 Datos procesados para enviar al modelo:', empleadoData);
    
    // Crear el empleado primero
    const result = await Empleados.createEmpleado(empleadoData);
    console.log('✅ Empleado creado exitosamente:', result);
    
    // Si se proporcionó una contraseña, crear las credenciales de acceso
    if (req.body.password && result.recordset && result.recordset[0]) {
      const empleadoId = result.recordset[0].id_empleado;
      console.log('🔐 Creando credenciales de acceso para empleado ID:', empleadoId);
      
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      
      // Insertar en T_Auth
      const pool = await poolPromise;
      await pool.request()
        .input('email', sql.NVarChar(50), req.body.email)
        .input('password', sql.NVarChar(255), hashedPassword)
        .input('tipo_usuario', sql.VarChar(20), 'empleado') // Tipo de usuario empleado
        .input('id_cliente', sql.Int, null)
        .input('id_empleado', sql.Int, empleadoId)
        .query('INSERT INTO T_Auth (email, password, tipo_usuario, id_cliente, id_empleado) VALUES (@email, @password, @tipo_usuario, @id_cliente, @id_empleado)');
      
      console.log('✅ Credenciales de acceso creadas exitosamente');
    }
    
    res.status(201).json({ mensaje: 'Empleado creado correctamente', result });
  } catch (error) {
    console.error('❌ Error al crear empleado:', error);
    res.status(500).json({ error: 'Error al crear empleado', detalle: error.message });
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
    console.log(`🗑️ Intentando eliminar empleado con ID: ${req.params.id}`);
    
    const result = await Empleados.deleteEmpleado(req.params.id);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    console.log('✅ Empleado eliminado correctamente');
    res.json({ mensaje: 'Empleado eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar empleado:', error);
    
    // Verificar si es un error de restricción de clave foránea
    if (error.message && error.message.includes('REFERENCE constraint')) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el empleado porque tiene citas asignadas o está relacionado con otros registros' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al eliminar empleado', 
      detalle: error.message 
    });
  }
}

module.exports = {
  listarEmpleados,
  obtenerEmpleado,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado
};
