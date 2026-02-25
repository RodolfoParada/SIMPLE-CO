import { Router } from './router.js';
import { Views } from './views.js';
import { Pagination } from './components/Pagination.js';
import { Modal } from './components/Modal.js';
import { ImagenClick } from './components/ImagenClick.js';

let productosData = [];
let carrito = [];
let pagination;

const iniciarApp = async () => {

   aplicarModoGuardado();
   iniciarModoOscuro(); 

    const res = await fetch('./data/productos.json');
    productosData = await res.json();

    const rutas = {
        "/": () => renderCatalogo(),
        "/carrito": () => Views.carrito(carrito)
    };

    const miRouter = new Router(rutas, "view-container");

  document.addEventListener("vistaCargada", () => {
    asignarEventosCompra();
    activarImagenClick();
    if (pagination) {
        pagination.attachEvents();
    }
});

    miRouter._render("/");
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
function asignarEventosCompra() {
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.dataset.id;
            const producto = productosData.find(p => p.id == id);
            carrito.push(producto);
            Modal.show(`Se agregó "${producto.nombre}" al carrito.`);
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