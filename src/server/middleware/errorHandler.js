export function esIdValido(id) {
  return /^[0-9a-fA-F]{24}$/.test(String(id));
}

export const manejarErrores = (err, req, res, next) => {
  console.error('Error:', err.message);
  const status = err.status || 500;
  const respuesta = {
    exito: false,
    mensaje: err.message || 'Error interno del servidor',
  };
  if (process.env.NODE_ENV === 'desarrollo') {
    respuesta.pila = err.stack;
  }
  res.status(status).json(respuesta);
};

export const rutaNoEncontrada = (req, res) => {
  res.status(404).json({
    exito: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};
