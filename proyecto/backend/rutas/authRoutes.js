
const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verificarToken } = require('./auth');
const { body, validationResult } = require('express-validator');

const SECRET_KEY = process.env.JWT_SECRET;
// Actualizar perfil del usuario autenticado (empleado)
const { setHorariosEmpleado, getHorariosEmpleado } = require('../modelos/empleadohorarios');
router.put('/update-profile-empleado', verificarToken, [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('id_especialidad').isInt().withMessage('La especialidad es obligatoria'),
  body('id_horarios').isArray({ min: 1 }).withMessage('Debes seleccionar al menos un horario'),
  body('id_horarios.*').isInt().withMessage('Cada horario debe ser un número'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  next();
}, async (req, res) => {
  const { nombre, telefono, email, fecha_nacimiento, id_especialidad, id_horarios } = req.body;
  const user = req.user;
  if (!user || !user.id_empleado) {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }
  try {
    // Log para depuración
    console.log('Datos recibidos para actualizar empleado:', { nombre, telefono, email, fecha_nacimiento, id_especialidad, id_horarios, id_empleado: user.id_empleado });
    const pool = await poolPromise;
    
    // Tomar el primer horario del array para actualizar el campo id_horario
    const id_horario = id_horarios[0];
    
    // Actualizar tabla T_Empleados
    await pool.request()
      .input('id_empleado', sql.Int, user.id_empleado)
      .input('nombre_empleado', sql.VarChar(50), nombre)
      .input('telefono', sql.VarChar(50), telefono)
      .input('email', sql.NVarChar(50), email)
      .input('fecha_registro', sql.Date, fecha_nacimiento)
      .input('id_especialidad', sql.Int, id_especialidad)
      .input('id_horario', sql.Int, id_horario)
      .query('UPDATE T_Empleados SET nombre_empleado = @nombre_empleado, telefono = @telefono, email = @email, fecha_registro = @fecha_registro, id_especialidad = @id_especialidad, id_horario = @id_horario WHERE id_empleado = @id_empleado');
    
    // También actualizar el email en la tabla T_Auth
    if (email) {
      await pool.request()
        .input('id_empleado', sql.Int, user.id_empleado)
        .input('email', sql.NVarChar(50), email)
        .query('UPDATE T_Auth SET email = @email WHERE id_empleado = @id_empleado');
    }
    
    res.json({ mensaje: 'Perfil de empleado actualizado correctamente', id_horarios: [id_horario] });
  } catch (error) {
    console.error('Error al actualizar perfil de empleado:', error);
    res.status(500).json({ mensaje: 'Error al actualizar perfil de empleado', error: error.message });
  }
});

// Actualizar perfil del usuario autenticado (cliente)
router.put('/update-profile', verificarToken, [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
  body('email').isEmail().withMessage('El correo debe ser válido'),
  body('fecha_nacimiento').isISO8601().withMessage('La fecha de nacimiento debe ser válida'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  next();
}, async (req, res) => {
  const { nombre, telefono, email, fecha_nacimiento } = req.body;
  const user = req.user;
  if (!user || !user.id_cliente) {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_cliente', sql.Int, user.id_cliente)
      .input('nombre_cliente', sql.VarChar(50), nombre)
      .input('telefono', sql.VarChar(50), telefono)
      .input('correo_electronico', sql.NVarChar(50), email)
      .input('fecha_registro', sql.Date, fecha_nacimiento)
      .query('UPDATE T_Clientes SET nombre_cliente = @nombre_cliente, telefono = @telefono, correo_electronico = @correo_electronico, fecha_registro = @fecha_registro WHERE id_cliente = @id_cliente');
    await pool.request()
      .input('id_cliente', sql.Int, user.id_cliente)
      .input('email', sql.NVarChar(50), email)
      .query('UPDATE T_Auth SET email = @email WHERE id_cliente = @id_cliente');
    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar perfil', error: error.message });
  }
});

// Registro: crea un nuevo cliente y usuario de autenticación
router.post('/register', [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('El correo debe ser válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
  body('fechaNacimiento').isISO8601().withMessage('La fecha de nacimiento debe ser válida'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  next();
}, async (req, res) => {
  const { nombre, email, password, telefono, fechaNacimiento } = req.body;
  if (!nombre || !email || !password || !telefono || !fechaNacimiento) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }
  try {
    const pool = await poolPromise;
    const existe = await pool.request()
      .input('email', sql.NVarChar(50), email)
      .query('SELECT * FROM T_Auth WHERE email = @email');
    if (existe.recordset.length > 0) {
      return res.status(409).json({ mensaje: 'El email ya está registrado' });
    }
    const clienteResult = await pool.request()
      .input('nombre_cliente', sql.VarChar(50), nombre)
      .input('apellido_cliente', sql.VarChar(50), '')
      .input('telefono', sql.VarChar(50), telefono)
      .input('correo_electronico', sql.NVarChar(50), email)
      .input('fecha_registro', sql.Date, fechaNacimiento)
      .query('INSERT INTO T_Clientes (nombre_cliente, apellido_cliente, telefono, correo_electronico, fecha_registro) OUTPUT INSERTED.id_cliente VALUES (@nombre_cliente, @apellido_cliente, @telefono, @correo_electronico, @fecha_registro)');
    const id_cliente = clienteResult.recordset[0].id_cliente;
    const hash = await bcrypt.hash(password, 10);
    await pool.request()
      .input('email', sql.NVarChar(50), email)
      .input('password', sql.NVarChar(255), hash)
      .input('tipo_usuario', sql.NVarChar(20), 'cliente')
      .input('id_cliente', sql.Int, id_cliente)
      .input('id_empleado', sql.Int, null)
      .query('INSERT INTO T_Auth (email, password, tipo_usuario, id_cliente, id_empleado) VALUES (@email, @password, @tipo_usuario, @id_cliente, @id_empleado)');
    // Obtener info del cliente recién creado
    const cliente = await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .query('SELECT * FROM T_Clientes WHERE id_cliente = @id_cliente');
    const userInfo = cliente.recordset[0];
    // Generar token con expiración de 2 horas
    const token = jwt.sign({ id: id_cliente, email, ...userInfo }, SECRET_KEY, { expiresIn: '2h' });
    res.status(201).json({ mensaje: 'Usuario registrado correctamente', token, usuario: userInfo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
});

// Login: valida contra T_Auth y devuelve token con info de usuario
router.post('/login', [
  body('email').isEmail().withMessage('El correo debe ser válido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  next();
}, async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar(50), email)
      .query('SELECT * FROM T_Auth WHERE email = @email');
    if (result.recordset.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    const user = result.recordset[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    let userInfo = { tipo_usuario: user.tipo_usuario };
    if (user.tipo_usuario === 'cliente' && user.id_cliente) {
      const cliente = await pool.request()
        .input('id_cliente', sql.Int, user.id_cliente)
        .query('SELECT * FROM T_Clientes WHERE id_cliente = @id_cliente');
      userInfo = { ...userInfo, ...cliente.recordset[0] };
    } else if (user.tipo_usuario === 'empleado' && user.id_empleado) {
      const empleado = await pool.request()
        .input('id_empleado', sql.Int, user.id_empleado)
        .query('SELECT * FROM T_Empleados WHERE id_empleado = @id_empleado');
      // Obtener los id_horarios del empleado
      const { getHorariosEmpleado } = require('../modelos/empleadohorarios');
      const id_horarios = await getHorariosEmpleado(user.id_empleado);
      userInfo = { ...userInfo, ...empleado.recordset[0], id_horarios };
    }
    const token = jwt.sign({ id: user.id, email: user.email, ...userInfo }, SECRET_KEY, { expiresIn: '2h' });
    res.json({ token, usuario: userInfo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
});

// Ruta protegida ejemplo
router.get('/perfil', verificarToken, async (req, res) => {
  let usuario = req.user;
  if (usuario && usuario.tipo_usuario === 'empleado' && usuario.id_empleado) {
    const { getHorariosEmpleado } = require('../modelos/empleadohorarios');
    const id_horarios = await getHorariosEmpleado(usuario.id_empleado);
    usuario = { ...usuario, id_horarios };
  }
  res.json({ mensaje: 'Acceso autorizado', usuario });
});

// Endpoint protegido para registrar empleados (solo admin)
router.post('/register-empleado', verificarToken, async (req, res) => {
  if (!req.user || req.user.tipo_usuario !== 'empleado' || (req.user.rol !== 'admin' && req.user.rol !== 'empleado')) {
    return res.status(403).json({ mensaje: 'Solo empleados o admin pueden crear empleados o clientes' });
  }
  const { nombre, email, password, telefono, fechaNacimiento, rol, tipo_usuario } = req.body;
  if (!nombre || !email || !password || !telefono || !fechaNacimiento) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }
  const rolFinal = rol || 'empleado';
  const tipoFinal = tipo_usuario === 'cliente' ? 'cliente' : 'empleado';
  try {
    const pool = await poolPromise;
    const existe = await pool.request()
      .input('email', sql.NVarChar(50), email)
      .query('SELECT * FROM T_Auth WHERE email = @email');
    if (existe.recordset.length > 0) {
      return res.status(409).json({ mensaje: 'El email ya está registrado' });
    }
    let id_empleado = null;
    let id_cliente = null;
    if (tipoFinal === 'empleado') {
      const empleadoResult = await pool.request()
        .input('nombre_empleado', sql.VarChar(50), nombre)
        .input('apellido_empleado', sql.VarChar(50), '')
        .input('telefono', sql.VarChar(50), telefono)
        .input('correo_electronico', sql.NVarChar(50), email)
        .input('fecha_registro', sql.Date, fechaNacimiento)
        .input('rol', sql.NVarChar(20), rolFinal)
        .query('INSERT INTO T_Empleados (nombre_empleado, apellido_empleado, telefono, correo_electronico, fecha_registro, rol) OUTPUT INSERTED.id_empleado VALUES (@nombre_empleado, @apellido_empleado, @telefono, @correo_electronico, @fecha_registro, @rol)');
      id_empleado = empleadoResult.recordset[0].id_empleado;
    } else {
      const clienteResult = await pool.request()
        .input('nombre_cliente', sql.VarChar(50), nombre)
        .input('apellido_cliente', sql.VarChar(50), '')
        .input('telefono', sql.VarChar(50), telefono)
        .input('correo_electronico', sql.NVarChar(50), email)
        .input('fecha_registro', sql.Date, fechaNacimiento)
        .query('INSERT INTO T_Clientes (nombre_cliente, apellido_cliente, telefono, correo_electronico, fecha_registro) OUTPUT INSERTED.id_cliente VALUES (@nombre_cliente, @apellido_cliente, @telefono, @correo_electronico, @fecha_registro)');
      id_cliente = clienteResult.recordset[0].id_cliente;
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.request()
      .input('email', sql.NVarChar(50), email)
      .input('password', sql.NVarChar(255), hash)
      .input('tipo_usuario', sql.NVarChar(20), tipoFinal)
      .input('id_cliente', sql.Int, id_cliente)
      .input('id_empleado', sql.Int, id_empleado)
      .query('INSERT INTO T_Auth (email, password, tipo_usuario, id_cliente, id_empleado) VALUES (@email, @password, @tipo_usuario, @id_cliente, @id_empleado)');
    res.status(201).json({ mensaje: tipoFinal === 'empleado' ? 'Empleado registrado correctamente' : 'Cliente registrado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar', error: error.message });
  }
});

// Obtener perfil del usuario autenticado desde las tablas correspondientes
router.get('/profile', verificarToken, async (req, res) => {
  const user = req.user;
  try {
    const pool = await poolPromise;
    
    if (user.id_empleado) {
      // Si es empleado, obtener datos de la tabla T_Empleados con especialidad y horarios
      const empleadoResult = await pool.request()
        .input('id_empleado', sql.Int, user.id_empleado)
        .query(`
          SELECT 
            e.id_empleado,
            e.nombre_empleado,
            e.telefono,
            e.email,
            e.fecha_registro,
            e.id_especialidad,
            e.id_horario,
            e.rol,
            esp.nombre_especialidad,
            a.email as auth_email,
            a.tipo_usuario
          FROM T_Empleados e
          LEFT JOIN C_Especialidad esp ON e.id_especialidad = esp.id_especialidad
          LEFT JOIN T_Auth a ON e.id_empleado = a.id_empleado
          WHERE e.id_empleado = @id_empleado
        `);

      if (empleadoResult.recordset.length === 0) {
        return res.status(404).json({ mensaje: 'Empleado no encontrado' });
      }

      const empleado = empleadoResult.recordset[0];

      // Obtener información del horario asignado al empleado
      let horarios = [];
      let id_horarios = [];
      
      if (empleado.id_horario) {
        const horarioResult = await pool.request()
          .input('id_horario', sql.Int, empleado.id_horario)
          .query(`
            SELECT id_horario, dia, hora_inicio, hora_fin
            FROM T_Horarios 
            WHERE id_horario = @id_horario
          `);
        
        if (horarioResult.recordset.length > 0) {
          horarios = horarioResult.recordset;
          id_horarios = [empleado.id_horario];
        }
      }

      res.json({
        ...empleado,
        fecha_nacimiento: empleado.fecha_registro,
        id_horarios,
        horarios,
        especialidad: empleado.nombre_especialidad
      });

    } else if (user.id_cliente) {
      // Si es cliente, obtener datos de la tabla T_Clientes
      const clienteResult = await pool.request()
        .input('id_cliente', sql.Int, user.id_cliente)
        .query(`
          SELECT 
            c.id_cliente,
            c.nombre_cliente,
            c.telefono,
            c.correo_electronico,
            c.fecha_registro as fecha_nacimiento,
            a.email,
            a.tipo_usuario
          FROM T_Clientes c
          LEFT JOIN T_Auth a ON c.id_cliente = a.id_cliente
          WHERE c.id_cliente = @id_cliente
        `);

      if (clienteResult.recordset.length === 0) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }

      const cliente = clienteResult.recordset[0];
      res.json(cliente);

    } else {
      return res.status(400).json({ mensaje: 'Usuario no válido' });
    }

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener perfil', error: error.message });
  }
});

module.exports = router;
