import { Router } from './router.js';
import { Views } from './views.js';
import { Pagination } from './components/Pagination.js';

let productosData = [];
let carrito = [];
let pagination;

const iniciarApp = async () => {

    const res = await fetch('./data/productos.json');
    productosData = await res.json();

    const rutas = {
        "/": () => renderCatalogo(),
        "/carrito": () => Views.carrito(carrito)
    };

    const miRouter = new Router(rutas, "view-container");

    document.addEventListener("vistaCargada", () => {
        asignarEventosCompra();
        if (pagination) {
            pagination.attachEvents();
        }
    });

    miRouter._render("/");
};

function renderCatalogo() {

    pagination = new Pagination({
        totalItems: productosData.length,
        itemsPerPage: 6,
        currentPage: pagination?.currentPage || 1,
        onPageChange: () => {
            document.getElementById("view-container").innerHTML = renderCatalogo();
            asignarEventosCompra();
            pagination.attachEvents();
        }
    });

    const productosPagina = pagination.paginate(productosData);

    return Views.catalogo(
        productosPagina,
        pagination.render()
    );
}

function asignarEventosCompra() {
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.dataset.id;
            const producto = productosData.find(p => p.id == id);
            carrito.push(producto);
            alert(`Añadido: ${producto.nombre}`);
        };
    });
}

iniciarApp();