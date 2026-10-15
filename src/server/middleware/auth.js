export function autenticado(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ exito: false, mensaje: 'Debes iniciar sesión para realizar esta acción' });
  }
  next();
}

export function soloAdmin(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ exito: false, mensaje: 'Debes iniciar sesión' });
  }
  if (req.session.usuario.role !== 'admin') {
    return res.status(403).json({ exito: false, mensaje: 'Acceso denegado: se requiere rol de administrador' });
  }
  next();
}
