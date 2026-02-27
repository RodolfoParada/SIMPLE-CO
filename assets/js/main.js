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


// Localiza la función asignarEventosCompra en main.js
function asignarEventosCompra() {
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.currentTarget.dataset.id;
            let carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
            
            const producto = productosData.find(p => String(p.id) === String(id));
            if (!producto) return;

            // Buscamos si seleccionó talla en el selector del catálogo
            const select = document.querySelector(`.talla-select[data-id="${id}"]`);
            const tallaSeleccionada = (select && select.value !== "") ? select.value : null;

            // CAMBIO CLAVE: Si no hay talla, la cantidad DEBE ser 0
            const nuevoItem = {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                url: producto.url,
                talla: tallaSeleccionada, 
                cantidad: tallaSeleccionada ? 1 : 0 // Cantidad 0 si la talla es null
            };

            // Validar si ya existe la misma combinación id+talla
            const yaExiste = carritoActual.some(p => 
                String(p.id) === String(id) && String(p.talla) === String(tallaSeleccionada)
            );

            if (yaExiste) {
                Modal.show("⚠️ Este producto ya está en el carrito.");
                return;
            }

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

// Dentro de main.js, añade este listener para capturar los clics en el contenedor del carrito
document.addEventListener("vistaCargada", (e) => {
    if (e.detail.path === "/carrito") {
        asignarEventosCarritoDinamico();
    }
});




function asignarEventosCarritoDinamico() {
    const container = document.getElementById("view-container");
    if (!container) return; 

    container.addEventListener("click", (e) => { 
        // --- LÓGICA AGREGAR TALLA ---
        const btnConfirmar = e.target.closest(".btn-confirmar-talla"); 
        if (btnConfirmar) {
            const id = btnConfirmar.dataset.id; 
            const selectTalla = container.querySelector(`.select-talla-dinamica[data-id="${id}"]`); 
            const inputCant = container.querySelector(`.input-cantidad-dinamica[data-id="${id}"]`); 
            
            const talla = selectTalla ? selectTalla.value : null; 
            const cantidad = inputCant ? parseInt(inputCant.value) : 1; 

            if (!talla) {
                Modal.show("⚠️ Por favor, selecciona una talla.");
                return;
            }

            let carritoActual = JSON.parse(localStorage.getItem("carrito")) || []; 

            // Validar si la talla ya existe para este producto [cite: 387, 391]
            const existeTalla = carritoActual.some(p => 
                String(p.id) === String(id) && String(p.talla) === String(talla) 
            );

            if (existeTalla) {
                Modal.show(`⚠️ La talla ${talla} ya está en el listado.`); 
                return;
            }

            // Buscar datos originales del producto [cite: 379]
            const productoOriginal = productosData.find(p => String(p.id) === String(id)); 
            if (!productoOriginal) return;

            const nuevoItem = {
                id: productoOriginal.id, 
                nombre: productoOriginal.nombre, 
                precio: productoOriginal.precio, 
                url: productoOriginal.url, 
                talla: talla,
                cantidad: cantidad 
            }


       



            // --- LÓGICA PARA MANTENER LA POSICIÓN ---
            // Buscamos el primer elemento que coincida con este ID (para saber dónde está la tarjeta)
            const indiceOriginal = carritoActual.findIndex(p => String(p.id) === String(id));

            if (indiceOriginal !== -1) {
                // Si el item encontrado no tiene talla (fue agregado vacío del catálogo), lo reemplazamos
                if (carritoActual[indiceOriginal].talla === null) {
                    carritoActual[indiceOriginal] = nuevoItem;
                } else {
                    // Si ya tiene tallas, insertamos la nueva después de la última talla de ese mismo ID
                    const ultimoIndiceMismoID = carritoActual.findLastIndex(p => String(p.id) === String(id));
                    carritoActual.splice(ultimoIndiceMismoID + 1, 0, nuevoItem);
                }
            } else {
                // Caso improbable en esta vista, pero por seguridad:
                carritoActual.push(nuevoItem); 
            }

            localStorage.setItem("carrito", JSON.stringify(carritoActual)); 
            
            // Actualizar vista manteniendo la posición visual [cite: 367]
            container.innerHTML = renderCarrito(); 
            if (pagination) pagination.attachEvents(); 
        }

        // --- LÓGICA ELIMINAR TALLA ESPECÍFICA ---
     const btnEliminarTalla = e.target.closest(".btn-eliminar-talla");

if (btnEliminarTalla) {
    const id = btnEliminarTalla.dataset.id;
    const talla = btnEliminarTalla.dataset.talla;

    let carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];

    // CAMBIO: En lugar de eliminar, reseteamos los valores de esa talla específica
    carritoActual = carritoActual.map(p => {
        if (String(p.id) === String(id) && String(p.talla) === String(talla)) {
            return {
                ...p,
                talla: null,    // Volvemos a null para que views.js oculte los datos 
                cantidad: 0     // Volvemos a 0 para que el subtotal sea cero [cite: 396-403]
            };
        }
        return p;
    });

    localStorage.setItem("carrito", JSON.stringify(carritoActual));
    
    // Renderizamos de nuevo para que aparezcan los selectores "Elegir..." [cite: 497]
    container.innerHTML = renderCarrito();
    if (pagination) pagination.attachEvents();
}

// Lógica boton editar
// --- LÓGICA BOTÓN EDITAR (SOLUCIÓN DEFINITIVA) ---
const btnEditar = e.target.closest(".btn-editar-talla");

if (btnEditar) {
    const id = btnEditar.dataset.id;
    const talla = btnEditar.dataset.talla;

    // 1. Obtener la data más reciente del LocalStorage [cite: 358]
    const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
    const itemActual = carritoActual.find(p => 
        String(p.id) === String(id) && String(p.talla) === String(talla)
    );

    if (itemActual) {
        const mensajeHtml = `
            <p>Modificar cantidad para la talla <strong>${talla}</strong>:</p>
            <input type="number" id="input-nueva-cant" class="form-control text-center mx-auto" 
                   value="${itemActual.cantidad}" min="1" style="width: 100px;">
        `;

        // 2. Mostrar el modal con autoClose en false para evitar que desaparezca 
        Modal.show(mensajeHtml, "Editar Cantidad", false);

        // 3. Capturamos el botón del modal manualmente para asegurar el evento
        const btnGuardarModal = document.getElementById("modal-close");
        
        if (btnGuardarModal) {
            btnGuardarModal.onclick = (event) => {
                event.preventDefault(); // Evitamos cualquier comportamiento por defecto
                
                const input = document.getElementById("input-nueva-cant");
                const nuevaCant = parseInt(input.value);

                if (!isNaN(nuevaCant) && nuevaCant > 0) {
                    // Volvemos a leer el storage para evitar colisiones de datos
                    let carritoData = JSON.parse(localStorage.getItem("carrito")) || [];

                    // Actualizamos el registro específico [cite: 359-361]
                    carritoData = carritoData.map(p => {
                        if (String(p.id) === String(id) && String(p.talla) === String(talla)) {
                            return { ...p, cantidad: nuevaCant };
                        }
                        return p;
                    });

                    // Guardamos y cerramos el modal [cite: 363, 183]
                    localStorage.setItem("carrito", JSON.stringify(carritoData));
                    document.getElementById("custom-modal").remove();
                    
                    // 4. Forzamos el refresco de la vista del carrito [cite: 367, 497]
                    // Usamos la función global renderCarrito() para actualizar subtotales y resumen
                    const viewContainer = document.getElementById("view-container");
                    if (viewContainer) {
                        // Llamamos directamente a la función que renderiza el carrito pasándole la data actualizada
                        viewContainer.innerHTML = renderCarrito();
                        
                        // Re-vinculamos los eventos de la vista cargada [cite: 276-282, 300]
                        if (typeof pagination !== 'undefined' && pagination.attachEvents) {
                            pagination.attachEvents();
                        }
                    }
                } else {
                    input.style.border = "2px solid red";
                }
            };
        }
    }
}

    });
}


}


iniciarApp();