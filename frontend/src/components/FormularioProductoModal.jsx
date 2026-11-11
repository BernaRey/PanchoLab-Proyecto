import React, { useEffect, useRef, useState } from 'react';

function crearFormulario(producto) {
  return {
    name: producto?.name || '',
    description: producto?.description || '',
    price: producto ? String(producto.price) : '',
    stock: producto ? String(producto.stock) : '',
    category: producto?.category || 'panchos',
    image: producto?.image || '',
    country: producto?.country || '',
    ingredients: Array.isArray(producto?.ingredients)
      ? producto.ingredients.join(', ')
      : '',
    isActive: producto?.isActive !== false,
  };
}

export default function FormularioProductoModal({
  producto,
  guardando,
  error,
  onGuardar,
  onCerrar,
}) {
  const [formulario, setFormulario] = useState(() => crearFormulario(producto));
  const referenciaNombre = useRef(null);
  const esEdicion = Boolean(producto);

  useEffect(() => {
    referenciaNombre.current?.focus();
    const overflowAnterior = document.body.style.overflow;

    function cerrarConEscape(evento) {
      if (evento.key === 'Escape' && !guardando) onCerrar();
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', cerrarConEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener('keydown', cerrarConEscape);
    };
  }, [guardando, onCerrar]);

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();
    const datos = {
      name: formulario.name.trim(),
      description: formulario.description.trim(),
      price: Number(formulario.price),
      stock: Number(formulario.stock),
      category: formulario.category,
      image: formulario.image.trim(),
      country: formulario.country.trim(),
      ingredients: formulario.ingredients
        .split(',')
        .map((ingrediente) => ingrediente.trim())
        .filter(Boolean),
      isActive: formulario.isActive,
    };

    await onGuardar(datos);
  }

  return (
    <div
      className="fondo-modal-admin"
      onClick={() => {
        if (!guardando) onCerrar();
      }}
      role="presentation"
    >
      <section
        className="modal-producto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-producto"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="encabezado-modal-producto">
          <h2 id="titulo-modal-producto">
            {esEdicion ? 'Editar producto' : 'Agregar producto'}
          </h2>
          <button
            type="button"
            className="boton-cerrar-modal"
            aria-label="Cerrar formulario"
            disabled={guardando}
            onClick={onCerrar}
          >
            ×
          </button>
        </header>

        <form className="formulario-producto" onSubmit={enviarFormulario}>
          {error && <p className="mensaje mensajeError" role="alert">{error}</p>}
          <div className="campos-modal-producto">
            <label className="campo-modal">
              Nombre
              <input
                ref={referenciaNombre}
                name="name"
                value={formulario.name}
                maxLength={120}
                autoComplete="off"
                required
                onChange={actualizarCampo}
              />
            </label>

            <label className="campo-modal campo-modal-ancho">
              Descripción
              <textarea
                name="description"
                value={formulario.description}
                rows={3}
                required
                onChange={actualizarCampo}
              />
            </label>

            <label className="campo-modal">
              Precio
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formulario.price}
                required
                onChange={actualizarCampo}
              />
            </label>

            <label className="campo-modal">
              Stock inicial
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formulario.stock}
                required
                onChange={actualizarCampo}
              />
            </label>

            <label className="campo-modal">
              País de origen
              <input
                name="country"
                value={formulario.country}
                maxLength={80}
                onChange={actualizarCampo}
              />
            </label>

            <label className="campo-modal">
              Categoría
              <select
                name="category"
                value={formulario.category}
                onChange={actualizarCampo}
              >
                <option value="panchos">Panchos</option>
                <option value="bebidas">Bebidas</option>
              </select>
            </label>

            <label className="campo-modal campo-modal-ancho">
              Imagen (URL)
              <input
                name="image"
                type="url"
                value={formulario.image}
                placeholder="https://..."
                onChange={actualizarCampo}
              />
            </label>

            <label className="campo-modal campo-modal-ancho">
              Ingredientes (separados por coma)
              <input
                name="ingredients"
                value={formulario.ingredients}
                onChange={actualizarCampo}
              />
            </label>

            <label className="campo-modal">
              Estado
              <select
                name="isActive"
                value={formulario.isActive ? 'true' : 'false'}
                onChange={(evento) => {
                  setFormulario((actual) => ({
                    ...actual,
                    isActive: evento.target.value === 'true',
                  }));
                }}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </label>
          </div>

          <div className="acciones-modal-producto">
            <button
              type="button"
              className="boton-cancelar-modal"
              disabled={guardando}
              onClick={onCerrar}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="boton-guardar-modal"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
