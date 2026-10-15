import { productos as apiProductos, auth } from '../services/api.js';
import Navbar from '../components/Navbar.js';
import Footer from '../components/Footer.js';

export default function PanelAdmin({ usuario, navegar, onAuth }) {
  const React = window.React;
  const h = React.createElement;

  if (!usuario || usuario.role !== 'admin') {
    navegar('/login');
    return h('div', { className: 'pagina', style: { textAlign: 'center', padding: '3rem' } },
      h('p', null, 'Redirigiendo al login...')
    );
  }

  const [productos, setProductos] = React.useState([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [editando, setEditando] = React.useState(null); // id del producto en edición
  const [form, setForm] = React.useState({
    name: '', description: '', price: '', stock: '', category: 'panchos', image: '', isActive: true
  });
  const [mensaje, setMensaje] = React.useState(null);
  const [tipoMensaje, setTipoMensaje] = React.useState('exito');

  React.useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      setCargando(true);
      const respuesta = await apiProductos.listar();
      setProductos(respuesta.datos || respuesta.productos || []);
      setError(null);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los productos');
    } finally {
      setCargando(false);
    }
  }

  function iniciarNuevo() {
    setEditando(null);
    setForm({ name: '', description: '', price: '', stock: '', category: 'panchos', image: '', isActive: true });
  }

  function iniciarEdicion(p) {
    setEditando(p._id || p.id);
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: String(p.price || ''),
      stock: String(p.stock || ''),
      category: p.category || 'panchos',
      image: p.image || '',
      isActive: p.isActive !== false,
    });
  }

  async function guardar(e) {
    e.preventDefault();
    setMensaje(null);
    const datos = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      image: form.image,
      isActive: form.isActive === true || form.isActive === 'true',
    };
    try {
      if (editando) {
        await apiProductos.actualizar(editando, datos);
        setMensaje('Producto actualizado correctamente');
      } else {
        await apiProductos.crear(datos);
        setMensaje('Producto creado correctamente');
      }
      setTipoMensaje('exito');
      iniciarNuevo();
      await cargar();
    } catch (e) {
      setMensaje(e.message || 'Error al guardar el producto');
      setTipoMensaje('error');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await apiProductos.eliminar(id);
      setMensaje('Producto eliminado');
      setTipoMensaje('exito');
      await cargar();
    } catch (e) {
      setMensaje(e.message || 'Error al eliminar');
      setTipoMensaje('error');
    }
  }

  async function cerrarSesion() {
    try { await auth.logout(); } catch (_) {}
    if (onAuth) onAuth();
  }

  const filas = productos.map((p) => {
    const disponible = p.isActive !== false && p.stock > 0;
    return h('tr', { key: p._id || p.id },
      h('td', null, p.codigo || (p._id || p.id).slice(-6)),
      h('td', null, p.name),
      h('td', null, (p.description || '').slice(0, 40) + ((p.description || '').length > 40 ? '…' : '')),
      h('td', { className: 'precioAdmin' }, `$${p.price}`),
      h('td', { className: 'stockAdmin' }, p.stock),
      h('td', null, p.category || 'panchos'),
      h('td', null, p.isActive !== false ? h('span', { className: 'activoSi' }, 'Activo') : h('span', { className: 'activoNo' }, 'Inactivo')),
      h('td', { className: 'accionesFila' },
        h('button', {
          className: 'botonEditar',
          onClick: () => iniciarEdicion(p),
        }, 'Editar'),
        h('button', {
          className: 'botonEliminar',
          onClick: () => eliminar(p._id || p.id),
        }, 'Eliminar')
      )
    );
  });

  return h('div', { className: 'pagina' },
    h(Navbar, { usuario, navegar }),
    h('main', null,
      h('div', { className: 'panelAdmin' },
        h('div', { className: 'panelHeader' },
          h('h2', null, 'Panel de Administración'),
          h('div', { className: 'adminActions' },
            h('button', {
              className: 'botonVolver',
              onClick: () => navegar('/'),
            }, 'Volver al catálogo'),
            h('button', { className: 'botonNuevo', onClick: iniciarNuevo }, 'Nuevo producto'),
            h('button', {
              className: 'boton boton-secundario',
              onClick: cerrarSesion,
            }, 'Cerrar sesión')
          )
        ),
        mensaje && h('div', { className: `mensaje mensaje${tipoMensaje === 'exito' ? 'Exito' : 'Error'}` }, mensaje),
        error && h('div', { className: 'mensaje mensajeError' }, error),
        h('div', { className: 'formularioAdmin' },
          h('h3', null, editando ? 'Editar producto' : 'Crear producto'),
          h('form', { onSubmit: guardar },
            h('div', { className: 'filaCampos' },
              h('div', { className: 'campo' },
                h('label', null, 'Nombre'),
                h('input', {
                  required: true,
                  value: form.name,
                  onChange: (e) => setForm({ ...form, name: e.target.value }),
                })
              ),
              h('div', { className: 'campo' },
                h('label', null, 'Descripción'),
                h('textarea', {
                  required: true,
                  value: form.description,
                  onChange: (e) => setForm({ ...form, description: e.target.value }),
                })
              ),
              h('div', { className: 'campo' },
                h('label', null, 'Precio'),
                h('input', {
                  type: 'number',
                  min: '0',
                  required: true,
                  value: form.price,
                  onChange: (e) => setForm({ ...form, price: e.target.value }),
                })
              ),
              h('div', { className: 'campo' },
                h('label', null, 'Stock'),
                h('input', {
                  type: 'number',
                  min: '0',
                  value: form.stock,
                  onChange: (e) => setForm({ ...form, stock: e.target.value }),
                })
              ),
              h('div', { className: 'campo' },
                h('label', null, 'Categoría'),
                h('select', {
                  value: form.category,
                  onChange: (e) => setForm({ ...form, category: e.target.value }),
                },
                  h('option', { value: 'panchos' }, 'Panchos'),
                  h('option', { value: 'bebidas' }, 'Bebidas')
                )
              ),
              h('div', { className: 'campo' },
                h('label', null, 'Imagen (URL)'),
                h('input', {
                  type: 'url',
                  value: form.image,
                  onChange: (e) => setForm({ ...form, image: e.target.value }),
                })
              ),
              h('div', { className: 'campo' },
                h('label', null, 'Estado'),
                h('select', {
                  value: form.isActive ? 'true' : 'false',
                  onChange: (e) => setForm({ ...form, isActive: e.target.value === 'true' }),
                },
                  h('option', { value: 'true' }, 'Activo'),
                  h('option', { value: 'false' }, 'Inactivo')
                )
              )
            ),
            h('div', { className: 'accionesForm' },
              h('button', {
                type: 'submit',
                className: 'botonGuardar',
              }, editando ? 'Actualizar producto' : 'Crear producto'),
              h('button', { type: 'button', className: 'botonCancelar', onClick: iniciarNuevo }, 'Cancelar')
            )
          )
        ),
        h('table', { className: 'tablaAdmin' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Código'),
              h('th', null, 'Nombre'),
              h('th', null, 'Descripción'),
              h('th', null, 'Precio'),
              h('th', null, 'Stock'),
              h('th', null, 'Categoría'),
              h('th', null, 'Estado'),
              h('th', null, 'Acciones')
            )
          ),
          h('tbody', null,
            cargando ? h('tr', null, h('td', { colSpan: 8 }, 'Cargando...')) :
              productos.length === 0 ? h('tr', null, h('td', { colSpan: 8 }, 'No hay productos.')) : filas
          )
        )
      )
    ),
    h(Footer, null)
  );
}
