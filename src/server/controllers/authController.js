import { User } from '../models/User.js';

export async function registro(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ exito: false, mensaje: 'Usuario y contraseña son obligatorios' });
    }
    if (String(username).trim().length < 3) {
      return res.status(400).json({ exito: false, mensaje: 'El usuario debe tener al menos 3 caracteres' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ exito: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existente = await User.findOne({ username: String(username).trim() });
    if (existente) {
      return res.status(409).json({ exito: false, mensaje: 'El usuario ya existe' });
    }

    const usuario = new User({ username: String(username).trim(), role: 'user' });
    usuario.setPassword(password);
    await usuario.save();

    req.session.usuario = {
      id: usuario._id.toString(),
      username: usuario.username,
      role: usuario.role,
    };
    return res.status(201).json({
      exito: true,
      mensaje: 'Usuario registrado',
      usuario: { id: usuario._id, username: usuario.username, role: usuario.role },
    });
  } catch (err) {
    return res.status(500).json({ exito: false, mensaje: err.message || 'Error al registrar' });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ exito: false, mensaje: 'Usuario y contraseña son obligatorios' });
    }

    const usuario = await User.findOne({ username: String(username).trim() });
    if (!usuario || !usuario.validarPassword(password)) {
      return res.status(401).json({ exito: false, mensaje: 'Credenciales inválidas' });
    }

    req.session.usuario = {
      id: usuario._id.toString(),
      username: usuario.username,
      role: usuario.role,
    };
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
  req.session.destroy(() => {
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
