import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { productos as apiProductos } from '../services/api.js';

const ContextoCarrito = createContext(null);

export function CarritoProveedor({ children }) {
  const [articulos, setArticulos] = useState([]);
  const [cargandoStock, setCargandoStock] = useState(false);
  const [errorStock, setErrorStock] = useState('');
  const articulosRef = useRef(articulos);

  function guardarArticulos(nuevosArticulos) {
    articulosRef.current = nuevosArticulos;
    setArticulos(nuevosArticulos);
  }

  const agregarProducto = useCallback((producto) => {
    const id = producto._id || producto.id;
    const stock = Math.floor(Number(producto.stock));

    if (!id) {
      return { exito: false, mensaje: 'No se pudo identificar el producto.' };
    }

    if (!Number.isFinite(stock) || stock < 1 || producto.isActive === false) {
      return { exito: false, mensaje: 'Este producto no tiene stock disponible.' };
    }

    const actual = articulosRef.current;
    const articuloExistente = actual.find((articulo) => articulo.productoId === id);

    if (articuloExistente && articuloExistente.cantidad >= stock) {
      return { exito: false, mensaje: 'Ya agregaste todo el stock disponible.' };
    }

    const nuevosArticulos = articuloExistente
      ? actual.map((articulo) => (
        articulo.productoId === id
          ? { ...articulo, producto, cantidad: articulo.cantidad + 1 }
          : articulo
      ))
      : [...actual, { productoId: id, producto, cantidad: 1 }];

    guardarArticulos(nuevosArticulos);
    return { exito: true, mensaje: `${producto.name} se agregó al carrito.` };
  }, []);

  const cambiarCantidad = useCallback((productoId, cantidadSolicitada) => {
    const cantidad = Math.floor(Number(cantidadSolicitada));
    const articulo = articulosRef.current.find((item) => item.productoId === productoId);

    if (!articulo || !Number.isFinite(cantidad)) return false;
    if (cantidad < 1) {
      guardarArticulos(
        articulosRef.current.filter((item) => item.productoId !== productoId)
      );
      return true;
    }

    const stock = Math.floor(Number(articulo.producto.stock));
    if (!Number.isFinite(stock)) return false;
    if (
      cantidad > articulo.cantidad
      && (cantidad > stock || articulo.producto.isActive === false)
    ) {
      return false;
    }

    guardarArticulos(
      articulosRef.current.map((item) => (
        item.productoId === productoId ? { ...item, cantidad } : item
      ))
    );
    return true;
  }, []);

  const sincronizarStock = useCallback(async () => {
    const articulosActuales = articulosRef.current;
    if (articulosActuales.length === 0) {
      setErrorStock('');
      return true;
    }

    setCargandoStock(true);
    setErrorStock('');

    try {
      const productosActualizados = await Promise.all(
        articulosActuales.map(async ({ productoId, producto }) => {
          try {
            const respuesta = await apiProductos.obtener(productoId);
            const productoActual = respuesta.datos || respuesta;
            return [productoId, productoActual];
          } catch (error) {
            if (error.status === 404) {
              return [productoId, { ...producto, stock: 0, isActive: false }];
            }
            throw error;
          }
        })
      );
      const productosPorId = new Map(productosActualizados);
      guardarArticulos(
        articulosRef.current.map((articulo) => {
          const producto = productosPorId.get(articulo.productoId);
          return producto ? { ...articulo, producto } : articulo;
        })
      );
      return true;
    } catch (error) {
      setErrorStock(error.message || 'No se pudo verificar el stock actual.');
      return false;
    } finally {
      setCargandoStock(false);
    }
  }, []);

  const quitarProducto = useCallback((productoId) => {
    guardarArticulos(
      articulosRef.current.filter((articulo) => articulo.productoId !== productoId)
    );
  }, []);

  const vaciarCarrito = useCallback(() => guardarArticulos([]), []);

  const cantidadTotal = useMemo(
    () => articulos.reduce((total, articulo) => total + articulo.cantidad, 0),
    [articulos]
  );

  const total = useMemo(
    () => articulos.reduce(
      (suma, articulo) => suma + Number(articulo.producto.price) * articulo.cantidad,
      0
    ),
    [articulos]
  );

  const valor = useMemo(() => ({
    articulos,
    cantidadTotal,
    total,
    cargandoStock,
    errorStock,
    agregarProducto,
    cambiarCantidad,
    sincronizarStock,
    quitarProducto,
    vaciarCarrito,
  }), [
    articulos,
    cantidadTotal,
    total,
    cargandoStock,
    errorStock,
    agregarProducto,
    cambiarCantidad,
    sincronizarStock,
    quitarProducto,
    vaciarCarrito,
  ]);

  return <ContextoCarrito.Provider value={valor}>{children}</ContextoCarrito.Provider>;
}

export function useCarrito() {
  const carrito = useContext(ContextoCarrito);
  if (!carrito) {
    throw new Error('useCarrito debe utilizarse dentro de CarritoProveedor.');
  }
  return carrito;
}
