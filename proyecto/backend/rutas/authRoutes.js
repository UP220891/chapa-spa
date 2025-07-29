const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verificarToken } = require('./auth');

const SECRET_KEY = process.env.JWT_SECRET;

// Actualizar perfil del usuario autenticado (cliente)
router.put('/update-profile', verificarToken, async (req, res) => {
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
router.post('/register', async (req, res) => {
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
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
});

// Login: valida contra T_Auth y devuelve token con info de usuario
router.post('/login', async (req, res) => {
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
      userInfo = { ...userInfo, ...empleado.recordset[0] };
    }
    const token = jwt.sign({ id: user.id, email: user.email, ...userInfo }, SECRET_KEY, { expiresIn: '2h' });
    res.json({ token, usuario: userInfo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
});

// Ruta protegida ejemplo
router.get('/perfil', verificarToken, (req, res) => {
  res.json({ mensaje: 'Acceso autorizado', usuario: req.user });
});

// Endpoint protegido para registrar empleados (solo admin)
router.post('/register-empleado', verificarToken, async (req, res) => {
  if (!req.user || req.user.tipo_usuario !== 'empleado' || req.user.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo el admin puede crear empleados o clientes' });
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

module.exports = router;
