// 1. Listado de productos (Simulando una base de datos)
const productos = [
    {
        id: 1,
        nombre: "Polera Azul",
        color: "Azul",
        precio: 44000,
        img: "./assets/img/azul.jpg"
    },
    {
        id: 2,
        nombre: "Polera Negra",
        color: "Negra",
        precio: 44000,
        img: "./assets/img/negro.jpg"
    },
    {
        id: 3,
        nombre: "Polera Toro",
        color: "Negro Toro",
        precio: 44000,
        img: "./assets/img/toro.jpg"
    }
];

// 2. Referencias a los elementos del DOM
const cartContainer = document.getElementById('cart-container');
const totalItemsTxt = document.getElementById('total-items');
const summaryCountTxt = document.getElementById('summary-count');
const subtotalTxt = document.getElementById('subtotal');
const shippingSelect = document.getElementById('shipping-select');
const totalFinalTxt = document.getElementById('total-final');

// 3. Función principal para renderizar el carro
function renderCart() {
    let htmlContent = '';
    let subtotal = 0;

    // Generar el HTML de cada producto dinámicamente
    productos.forEach((producto) => {
        subtotal += producto.precio;
        
        htmlContent += `
            <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div class="d-flex align-items-center">
                    <img src="${producto.img}" class="poleras rounded shadow-sm" alt="${producto.nombre}" style="width: 80px; height: 80px; object-fit: cover;">
                    <div class="ms-3">
                        <h6 class="mb-0 fw-bold">${producto.nombre}</h6>
                        <p class="text-muted small mb-0">${producto.color}</p>
                    </div>
                </div>
                <div class="fw-bold text-dark">
                    $ ${producto.precio.toLocaleString('es-CL')}
                </div>
            </div>
        `;
    });

    // Inyectar el contenido en el HTML
    cartContainer.innerHTML = htmlContent;
    
    // Actualizar contadores y precios
    actualizarTotales(subtotal);
}

// 4. Función para calcular y mostrar los totales
function actualizarTotales(subtotal) {
    const costoEnvio = parseInt(shippingSelect.value);
    const totalFinal = subtotal + costoEnvio;

    // Actualizar textos en el HTML
    totalItemsTxt.innerText = `${productos.length} items`;
    summaryCountTxt.innerText = `PRODUCTOS (${productos.length})`;
    subtotalTxt.innerText = `$ ${subtotal.toLocaleString('es-CL')}`;
    totalFinalTxt.innerText = `$ ${totalFinal.toLocaleString('es-CL')}`;
}

// 5. Evento para detectar cambios en el select de envío
shippingSelect.addEventListener('change', () => {
    // Volvemos a renderizar para recalcular todo con el nuevo costo de envío
    renderCart();
});

// 6. Ejecución inicial al cargar la página
document.addEventListener('DOMContentLoaded', renderCart);