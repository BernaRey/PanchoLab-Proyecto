import { User } from '../models/User.js';

function requiereBaseDeDatos(req, res) {
  if (!req.dbConectado) {
    res.status(503).json({
      exito: false,
      mensaje: 'La base de datos no está disponible para consultar la tienda.',
    });
    return true;
  }
  return false;
}

export async function obtenerEstado(req, res) {
  if (requiereBaseDeDatos(req, res)) return;

  try {
    const administrador = await User.findOne({ role: 'admin' })
      .select('tiendaAbierta')
      .lean();

    return res.json({
      exito: true,
      abierta: administrador ? administrador.tiendaAbierta !== false : true,
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: error.message || 'No se pudo consultar el estado de la tienda.',
    });
  }
}

export async function actualizarEstado(req, res) {
  if (requiereBaseDeDatos(req, res)) return;

  if (typeof req.body.abierta !== 'boolean') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El estado de la tienda debe ser abierto o cerrado.',
    });
  }

  try {
    const administrador = await User.findOne({
      _id: req.session.usuario.id,
      role: 'admin',
    });

    if (!administrador) {
      return res.status(404).json({
        exito: false,
        mensaje: 'No se encontró la cuenta administradora.',
      });
    }

    administrador.tiendaAbierta = req.body.abierta;
    await administrador.save();

    return res.json({
      exito: true,
      abierta: administrador.tiendaAbierta,
      mensaje: administrador.tiendaAbierta ? 'La tienda está abierta.' : 'La tienda está cerrada.',
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: error.message || 'No se pudo actualizar el estado de la tienda.',
    });
  }
}
