import { esIdValido } from './errorHandler.js';

export function validarId(req, res, next) {
  if (!esIdValido(req.params.id)) {
    return res.status(400).json({ exito: false, mensaje: 'ID de producto inválido' });
  }
  next();
}

export function validarProducto(req, res, next) {
  const {
    name,
    description,
    price,
    stock,
    category,
    image,
    country,
    ingredients,
    isActive,
  } = req.body;
  const errores = [];

  if (!name || String(name).trim().length === 0) errores.push('El nombre es obligatorio');
  if (!description || String(description).trim().length === 0) errores.push('La descripción es obligatoria');
  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    errores.push('El precio debe ser un número mayor o igual a 0');
  }
  if (stock !== undefined && stock !== null && (isNaN(Number(stock)) || Number(stock) < 0)) {
    errores.push('El stock debe ser un número mayor o igual a 0');
  }
  if (country !== undefined && country !== null && typeof country !== 'string') {
    errores.push('El país debe ser texto');
  }
  if (ingredients !== undefined && !Array.isArray(ingredients)) {
    errores.push('Los ingredientes deben enviarse como una lista');
  }
  if (Array.isArray(ingredients) && ingredients.some((item) => typeof item !== 'string')) {
    errores.push('Cada ingrediente debe ser texto');
  }
  if (
    isActive !== undefined
    && ![true, false, 'true', 'false'].includes(isActive)
  ) {
    errores.push('El estado del producto no es válido');
  }

  if (errores.length > 0) {
    return res.status(400).json({ exito: false, mensaje: errores.join(', ') });
  }

  req.body.datosValidos = {
    name: String(name).trim(),
    description: String(description).trim(),
    price: Number(price),
    stock: stock !== undefined && stock !== null ? Number(stock) : 0,
    category: category ? String(category).trim() : 'panchos',
    image: image ? String(image).trim() : '',
    country: country ? country.trim() : '',
    ingredients: Array.isArray(ingredients)
      ? ingredients.map((item) => item.trim()).filter(Boolean)
      : [],
    isActive: isActive === undefined ? true : isActive === true || isActive === 'true',
  };
  next();
}
