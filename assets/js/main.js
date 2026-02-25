import { Router } from './router.js';
import { Views } from './views.js';
import { Pagination } from './components/Pagination.js';
import { Modal } from './components/Modal.js';
import { ImagenClick } from './components/ImagenClick.js';

let productosData = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let pagination;
let miRouter;

const iniciarApp = async () => {

   aplicarModoGuardado();
   iniciarModoOscuro(); 

    const res = await fetch('./data/productos.json');
    productosData = await res.json();
 
     const rutas = {
    "/": () => renderCatalogo(),
    "/carrito": () => renderCarrito()
};
     miRouter = new Router(rutas, "view-container");
   
    asignarEventosEliminar();

  document.addEventListener("vistaCargada", () => {
    asignarEventosCompra();
    activarImagenClick();
    if (pagination) {
        pagination.attachEvents();
    }
});

miRouter.iniciar();
};

function renderCatalogo() {

    const paginaGuardada = localStorage.getItem("paginaActual");

    pagination = new Pagination({
        totalItems: productosData.length,
        itemsPerPage: 6,
        currentPage: paginaGuardada ? parseInt(paginaGuardada) : 1,
        onPageChange: (newPage) => {

            localStorage.setItem("paginaActual", newPage);
            pagination.currentPage = newPage;

            // SOLO DISPARA EL ROUTER OTRA VEZ
            const productosPagina = pagination.paginate(productosData);

            document.getElementById("view-container").innerHTML =
                Views.catalogo(productosPagina, pagination.render());

            asignarEventosCompra();
            activarImagenClick();
            pagination.attachEvents();
        }
    });

    const productosPagina = pagination.paginate(productosData);

    return Views.catalogo(
        productosPagina,
        pagination.render()
    );
}
function activarImagenClick() {
    document.querySelectorAll('.producto-img').forEach(img => {
        img.style.cursor = "zoom-in";
        img.onclick = () => {
            ImagenClick.open(img.src);
        };
    });
}

function renderCarrito() {

    // 🔥 Siempre sincronizar
    carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const itemsPorPagina = 6;
    const totalPaginas = Math.ceil(carrito.length / itemsPorPagina);

    let paginaGuardada = parseInt(localStorage.getItem("paginaCarrito")) || 1;

    // 🔥 Si carrito está vacío, limpiar paginación
    if (carrito.length === 0) {
        localStorage.removeItem("paginaCarrito");
        return Views.carrito([]);
    }

    // 🔥 Si la página guardada es inválida, corregir
    if (paginaGuardada > totalPaginas) {
        paginaGuardada = totalPaginas;
        localStorage.setItem("paginaCarrito", paginaGuardada);
    }

    pagination = new Pagination({
        totalItems: carrito.length,
        itemsPerPage: itemsPorPagina,
        currentPage: paginaGuardada,
        onPageChange: (newPage) => {

            localStorage.setItem("paginaCarrito", newPage);
            pagination.currentPage = newPage;

            const carritoPagina = pagination.paginate(carrito);

            document.getElementById("view-container").innerHTML =
                Views.carrito(carritoPagina) +
                pagination.render();

            pagination.attachEvents();
        }
    });

    const carritoPagina = pagination.paginate(carrito);

    return Views.carrito(carritoPagina) + pagination.render();
}

function asignarEventosEliminar() {

    const container = document.getElementById("view-container");
    if (!container) return;

    container.addEventListener("click", (e) => {

        const btn = e.target.closest(".btn-eliminar");
        if (!btn) return;

        const id = btn.dataset.id;
        const talla = btn.dataset.talla ?? null;

        let carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];

        carritoActual = carritoActual.filter(p =>
            !(String(p.id) === String(id) &&
              String(p.talla ?? null) === String(talla))
        );

        localStorage.setItem("carrito", JSON.stringify(carritoActual));

        // 🔥 ACTUALIZAR VARIABLE GLOBAL
        carrito = carritoActual;

        // 🔥 VOLVER A RENDERIZAR DIRECTAMENTE
        document.getElementById("view-container").innerHTML = renderCarrito();

        if (pagination) {
            pagination.attachEvents();
        }
    });
}


function asignarEventosCompra() {

    document.querySelectorAll('.btn-add').forEach(btn => {

        btn.onclick = (e) => {

            const id = e.currentTarget.dataset.id;

            // 🔥 Siempre sincronizar con localStorage
            let carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];

            const producto = productosData.find(p => 
                String(p.id) === String(id)
            );

            if (!producto) return;

            // 🔹 Si usas talla (opcional)
            const select = document.querySelector(`.talla-select[data-id="${id}"]`);
            const talla = select ? select.value : null;

            // 🔥 Validar si ya existe (id + talla)
            const yaExiste = carritoActual.some(p =>
                String(p.id) === String(id) &&
                String(p.talla ?? null) === String(talla)
            );

            if (yaExiste) {
                Modal.show("⚠️ Esta polera ya está en el carrito.");
                return;
            }

            // 🔥 Crear objeto limpio
            const nuevoItem = {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                url: producto.url,
                talla: talla,
                cantidad: 1
            };

            carritoActual.push(nuevoItem);

            localStorage.setItem("carrito", JSON.stringify(carritoActual));

            Modal.show(`✅ "${producto.nombre}" agregada al carrito.`);
        };

    });
}
function aplicarModoGuardado() {

    const modoGuardado = localStorage.getItem("modoOscuro");

    if (modoGuardado === "true") {
        document.body.classList.add("dark");
    }
}

function iniciarModoOscuro() {

    const toggleBtn = document.getElementById("toggle-dark");
    if (!toggleBtn) return;

    // 🔹 Leer estado guardado
    const modoGuardado = localStorage.getItem("modoOscuro");

    if (modoGuardado === "true") {
        document.body.classList.add("dark");
        toggleBtn.textContent = "☀️ Modo Claro";
    } else {
        toggleBtn.textContent = "🌙 Modo Oscuro";
    }

    // 🔹 Evento click
    toggleBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const modoActivo = document.body.classList.contains("dark");

        localStorage.setItem("modoOscuro", modoActivo);

        // Cambiar texto dinámicamente
        toggleBtn.textContent = modoActivo
            ? "☀️ Modo Claro"
            : "🌙 Modo Oscuro";
    });




}


iniciarApp();