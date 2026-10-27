import { productos as apiProductos } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.js';
import React from 'react';

export default function ProductoDetalle({
  id,
  usuario,
  navegar,
  tema,
  alCambiarTema,
  cantidadCarrito,
  alAbrirCarrito,
  alAgregarProducto,
  tiendaAbierta,
  cargandoTienda,
}) {
  const h = React.createElement;
  const [producto, setProducto] = React.useState(null);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [avisoCarrito, setAvisoCarrito] = React.useState('');
  const [errorCarrito, setErrorCarrito] = React.useState(false);

  React.useEffect(() => {
    let componenteActivo = true;

    (async () => {
      try {
        setCargando(true);
        setError(null);
        const respuesta = await apiProductos.obtener(id);
        if (componenteActivo) setProducto(respuesta.datos || respuesta);
      } catch (e) {
        if (componenteActivo) setError(e.message || 'No se pudo cargar el producto');
      } finally {
        if (componenteActivo) setCargando(false);
      }
    })();

    return () => {
      componenteActivo = false;
    };
  }, [id]);

  function agregarAlCarrito() {
    const resultado = alAgregarProducto(producto);
    setAvisoCarrito(resultado.mensaje);
    setErrorCarrito(!resultado.exito);
  }

  const stock = producto ? Math.max(0, Math.floor(Number(producto.stock) || 0)) : 0;
  const disponible = Boolean(producto)
    && stock > 0
    && producto.isActive !== false;
  const puedeAgregar = disponible && tiendaAbierta && !cargandoTienda;

  const contenido = h('div', { className: 'contenedor' },
    producto && producto.image && h('img', {
      className: 'imagen-detalle-producto',
      src: producto.image,
      alt: producto.name,
    }),
    producto && producto.country && h('p', { className: 'pais-catalogo' }, producto.country),
    h('h1', null, producto ? producto.name : 'Producto'),
    h('p', null, producto ? producto.description : ''),
    producto && h('p', null, `Precio: $${Number(producto.price).toFixed(2)}  |  Stock: ${stock}`),
    producto && h('button', {
      type: 'button',
      className: 'boton-producto',
      disabled: !puedeAgregar,
      onClick: agregarAlCarrito,
    }, cargandoTienda
      ? 'Verificando tienda...'
      : !tiendaAbierta
        ? 'TIENDA CERRADA'
        : disponible
          ? 'Agregar al carrito'
          : 'SIN STOCK'),
    avisoCarrito && h('p', {
      className: errorCarrito ? 'aviso-carrito aviso-carrito-error' : 'aviso-carrito',
      role: errorCarrito ? 'alert' : 'status',
    }, avisoCarrito),
    h('button', {
      className: 'boton boton-secundario',
      onClick: () => navegar('/'),
    }, 'Volver al catálogo')
  );

  if (cargando) {
    return h('div', { className: 'pagina' },
      h(Navbar, {
        usuario,
        navegar,
        tema,
        alCambiarTema,
        cantidadCarrito,
        alAbrirCarrito,
        tiendaAbierta,
        cargandoTienda,
      }),
      h('main', null, h('div', { className: 'estado spinnerCarga' },
        h('div', { className: 'iconoGrande' }, '🔬'),
        h('h3', null, 'Cargando producto...')
      )),
      h(Footer, null)
    );
  }

  if (error || !producto) {
    return h('div', { className: 'pagina' },
      h(Navbar, {
        usuario,
        navegar,
        tema,
        alCambiarTema,
        cantidadCarrito,
        alAbrirCarrito,
        tiendaAbierta,
        cargandoTienda,
      }),
      h('main', null, h('div', { className: 'estado mensajeError', role: 'alert' },
        h('div', { className: 'iconoGrande' }, '⚠️'),
        h('h3', null, 'Producto no encontrado'),
        h('p', null, error || 'El producto solicitado no existe.'),
        h('button', {
          className: 'boton boton-primario',
          onClick: () => navegar('/'),
        }, 'Volver al catálogo')
      )),
      h(Footer, null)
    );
  }

  return h('div', { className: 'pagina' },
    h(Navbar, {
      usuario,
      navegar,
      tema,
      alCambiarTema,
      cantidadCarrito,
      alAbrirCarrito,
      tiendaAbierta,
      cargandoTienda,
    }),
    h('main', null, h('div', { style: { maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' } }, contenido)),
    h(Footer, null)
  );
}
