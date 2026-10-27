import { User } from '../models/User.js';

function iniciarSesion(req, usuario) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      req.session.usuario = {
        id: usuario._id.toString(),
        username: usuario.username,
        role: usuario.role,
      };
      resolve();
    });
  });
}

export async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return res.status(400).json({ exito: false, mensaje: 'Usuario y contraseña son obligatorios' });
    }
    const nombreUsuario = username.trim();
    if (nombreUsuario.length < 3 || nombreUsuario.length > 30 || password.length > 128) {
      return res.status(400).json({ exito: false, mensaje: 'Las credenciales no tienen un formato válido' });
    }

    const usuario = await User.findOne({ username: nombreUsuario });
    const passwordValido = usuario ? usuario.validarPassword(password) : false;
    if (!usuario || usuario.role !== 'admin' || !passwordValido) {
      return res.status(401).json({ exito: false, mensaje: 'Credenciales inválidas' });
    }

    await iniciarSesion(req, usuario);
    return res.json({
      exito: true,
      mensaje: 'Inicio de sesión correcto',
      usuario: { id: usuario._id, username: usuario.username, role: usuario.role },
    });
  } catch (err) {
    return res.status(500).json({ exito: false, mensaje: err.message || 'Error al iniciar sesión' });
  }
}

export async function logout(req, res) {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ exito: false, mensaje: 'No se pudo cerrar la sesión' });
    }
    res.clearCookie('connect.sid');
    return res.json({ exito: true, mensaje: 'Sesión cerrada' });
  });
}

export async function me(req, res) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ exito: false, mensaje: 'No hay sesión activa' });
  }
  return res.json({ exito: true, usuario: req.session.usuario });
}
