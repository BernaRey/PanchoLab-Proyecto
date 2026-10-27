export const API_BASE = '';

export async function api(path, options = {}) {
  const respuesta = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  let datos;
  try {
    datos = await respuesta.json();
  } catch (_) {
    datos = {};
  }
  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || `Error ${respuesta.status}`);
    error.status = respuesta.status;
    error.datos = datos;
    throw error;
  }
  return datos;
}

export const auth = {
  login: (username, password) =>
    api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => api('/api/auth/logout', { method: 'POST' }),
  me: () => api('/api/auth/me'),
};

export const productos = {
  listar: (categoria, soloActivos = false) => {
    const parametros = new URLSearchParams();
    if (categoria) parametros.set('category', categoria);
    if (soloActivos) parametros.set('isActive', 'true');
    const consulta = parametros.toString();
    const qs = consulta ? `?${consulta}` : '';
    return api(`/api/products${qs}`);
  },
  obtener: (id) => api(`/api/products/${id}`),
  crear: (datos) => api('/api/products', { method: 'POST', body: JSON.stringify(datos) }),
  actualizar: (id, datos) => api(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  eliminar: (id) => api(`/api/products/${id}`, { method: 'DELETE' }),
};

export const tienda = {
  obtenerEstado: () => api('/api/tienda/estado'),
  actualizarEstado: (abierta) =>
    api('/api/tienda/estado', {
      method: 'PATCH',
      body: JSON.stringify({ abierta }),
    }),
};

export const checkout = {
  confirmarPedido: (pedido) =>
    api('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(pedido),
    }),
};
