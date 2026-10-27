export function formatearPrecio(precio) {
  const valor = Number(precio);
  if (!Number.isFinite(valor)) return 'Precio no disponible';
  return `$${valor.toFixed(2)}`;
}
