export function desplazarASeccion(id) {
  const seccion = document.getElementById(id);
  if (!seccion) return false;

  const posicion = window.scrollY + seccion.getBoundingClientRect().top;
  window.scrollTo({ top: posicion, behavior: 'smooth' });
  return true;
}
