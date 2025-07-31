const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('./config/database');

async function registrarEmpleadoYAuth() {
  const nombre_empleado = 'Alondra Chapa';
  const email = 'chapa@empleado.com';
  const password = 'empleado123';
  const rol = 'empleado';
  const id_especialidad = null;
  const id_horario = null;

  try {
    // 1. Crear empleado
    const pool = await poolPromise;
    const empleadoResult = await pool.request()
      .input('nombre_empleado', sql.VarChar(50), nombre_empleado)
      .input('id_especialidad', sql.Int, id_especialidad)
      .input('id_horario', sql.Int, id_horario)
      .input('rol', sql.NVarChar(20), rol)
      .query('INSERT INTO T_Empleados (nombre_empleado, id_especialidad, id_horario, rol) OUTPUT INSERTED.id_empleado VALUES (@nombre_empleado, @id_especialidad, @id_horario, @rol)');
    const id_empleado = empleadoResult.recordset[0].id_empleado;

    // 2. Hashear contraseña
    const hash = await bcrypt.hash(password, 10);

    // 3. Insertar en T_Auth
    await pool.request()
      .input('email', sql.NVarChar(50), email)
      .input('password', sql.NVarChar(255), hash)
      .input('tipo_usuario', sql.NVarChar(20), 'empleado')
      .input('id_cliente', sql.Int, null)
      .input('id_empleado', sql.Int, id_empleado)
      .query('INSERT INTO T_Auth (email, password, tipo_usuario, id_cliente, id_empleado) VALUES (@email, @password, @tipo_usuario, @id_cliente, @id_empleado)');

    console.log('Empleado y usuario creados correctamente.');
  } catch (err) {
    console.error('Error:', err);
  }
}

registrarEmpleadoYAuth();
