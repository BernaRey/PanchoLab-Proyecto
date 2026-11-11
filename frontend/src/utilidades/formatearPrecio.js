export function formatearPrecio(precio) {
  const valor = Number(precio);
  if (!Number.isFinite(valor)) return 'Precio no disponible';
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}
