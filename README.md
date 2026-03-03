### Proyecto Poleras_Store
#### Es una simulación de una tienda online que permite:

####  Visualizar catálogo de productos
####  Gestionar carrito de compras
####  Agregar múltiples tallas por productos
####  Editar cantidades dinámicamente
####  Eliminar productos o tallas específicas
####  Visualizar resumen de compra
####  Simula proceso de pago con validaciones
####  Modo oscuro persistente
####  Paginación dinámica

### Todo se implemento sin frameworks, usando Javascript vanilla moderno.


### Componentes reutilizables

- `Router.js` → Manejo de rutas SPA con Hash
- `Pagination.js` → Sistema de paginación dinámico
- `Modal.js` → Modal reutilizable (confirmación, pago, edición)
- `ImagenClick.js` → Lightbox para ampliar imágenes

---

## Funcionalidades Principales

### Catálogo
- Renderizado dinámico desde `productos.json`
- Paginación automática
- Contador de carrito en navbar
- Modal de especificaciones del producto
- Ampliación de imagen (lightbox)

---

### Carrito Inteligente
- Agrupación por producto
- Agregado de múltiples tallas
- Validación de tallas duplicadas
- Edición de cantidad en modal
- Eliminación individual por talla
- Eliminación total por producto
- Subtotal por producto
- Total general automático

---

### Proceso de Pago Simulado

Incluye:

- Resumen de compra detallado
- Cálculo correcto de:
  - Neto
  - IVA (19%)
  - Despacho
  - Total final
- Formulario de pago con validaciones:
  - Nombre obligatorio
  - RUT válido (8 números + dígito o K)
  - Email válido
  - Dirección alfanumérica
  - Banco obligatorio
  - Cuenta bancaria formateada automáticamente (16 dígitos en bloques de 4)

---

### Modo Oscuro Persistente
- Guardado en `localStorage`
- Cambio dinámico de estilos
- Mantiene estado al recargar

---

## Tecnologías Utilizadas

- HTML5
- CSS3
- Bootstrap 5
- JavaScript ES6+
- LocalStorage
- SPA con Hash Router

---

## Gestión de Estado

- `localStorage` para:
  - Carrito
  - Página actual
  - Modo oscuro
- Renderizado reactivo manual
- Delegación de eventos para elementos dinámicos

---

## Validaciones Implementadas

- Prevención de duplicados
- Validación de tallas
- Validación de campos obligatorios
- Formato automático de cuenta bancaria
- Validación de RUT con expresión regular
- Control de páginas inválidas en carrito

---

## Buenas Prácticas Aplicadas

- Separación de responsabilidades
- Componentes reutilizables
- Delegación de eventos
- Renderizado dinámico
- Uso correcto de `map`, `filter`, `reduce`
- Manejo de estado manual sin frameworks

---

## Posibles Mejoras Futuras

- Backend real con API
- Autenticación de usuarios
- Base de datos
- Control real de stock
- Integración con pasarela de pago real
- Filtros por categoría
- Buscador en catálogo

---

##  Autor

Rodolfo Parada  
Proyecto SPA - 2026  