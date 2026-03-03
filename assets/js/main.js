import { Router } from "./router.js";
import { Views } from "./views.js";
import { Pagination } from "./components/Pagination.js";
import { Modal } from "./components/Modal.js";
import { ImagenClick } from "./components/ImagenClick.js";

let productosData = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let pagination;
let miRouter;

function actualizarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");
  if (!contador) return; // 🔒 evita que se rompa si no existe

  const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];

  const productosUnicos = [
    ...new Map(carritoActual.map((item) => [item.id, item])).values(),
  ];

  const total = productosUnicos.length;

  contador.textContent = total;
  contador.style.display = total === 0 ? "none" : "inline-block";
}

const iniciarApp = async () => {
  aplicarModoGuardado();
  iniciarModoOscuro();

  const res = await fetch("./data/productos.json");
  productosData = await res.json();

  const rutas = {
    "/": () => renderCatalogo(),
    "/carrito": () => renderCarrito(),
  };
  miRouter = new Router(rutas, "view-container");

  asignarEventosEliminar();

  document.addEventListener("vistaCargada", () => {
    asignarEventosCompra();
    activarImagenClick();
    if (pagination) {
      pagination.attachEvents();
    }
    document.getElementById("view-container").addEventListener("click", (e) => {
      const btnSpecs = e.target.closest(".btn-especificaciones");
      if (!btnSpecs) return;

      const id = btnSpecs.dataset.id;

      const producto = productosData.find((p) => String(p.id) === String(id));

      if (!producto) return;

      let html = `
      <div style="text-align:left">
        <h5 class="mb-3">${producto.nombre}</h5>
        <p>${producto.descripcion || ""}</p>
    `;

      if (producto.especificaciones) {
        html += `
        <ul>
          ${producto.especificaciones
            .map((item) => `<li>${item}</li>`)
            .join("")}
        </ul>
      `;
      }

      html += `</div>`;

      Modal.show(html, "Especificaciones", false, "Cerrar");
    });
  });
  actualizarContadorCarrito();
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

      document.getElementById("view-container").innerHTML = Views.catalogo(
        productosPagina,
        pagination.render(),
      );

      asignarEventosCompra();
      activarImagenClick();
      pagination.attachEvents();
    },
  });

  const productosPagina = pagination.paginate(productosData);

  return Views.catalogo(productosPagina, pagination.render());
}
function activarImagenClick() {
  document.querySelectorAll(".producto-img").forEach((img) => {
    img.style.cursor = "zoom-in";
    img.onclick = () => {
      ImagenClick.open(img.src);
    };
  });
}

function renderCarrito() {
  // Siempre sincronizar
  carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const itemsPorPagina = 6;
  const totalPaginas = Math.ceil(carrito.length / itemsPorPagina);

  let paginaGuardada = parseInt(localStorage.getItem("paginaCarrito")) || 1;

  // Si carrito está vacío, limpiar paginación
  if (carrito.length === 0) {
    localStorage.removeItem("paginaCarrito");
    return Views.carrito([]);
  }

  // Si la página guardada es inválida, corregir
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
        Views.carrito(carritoPagina) + pagination.render();

      pagination.attachEvents();
    },
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

    //MOSTRAR MODAL DE CONFIRMACIÓN
    Modal.confirm("¿Estás seguro de eliminar esta polera del carrito?", () => {
      let carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];

      // ELIMINAR TODAS LAS TALLAS DEL PRODUCTO
      carritoActual = carritoActual.filter((p) => String(p.id) !== String(id));

      localStorage.setItem("carrito", JSON.stringify(carritoActual));
      actualizarContadorCarrito();
      //ACTUALIZAR VARIABLE GLOBAL
      carrito = carritoActual;

      //  RE-RENDERIZAR
      document.getElementById("view-container").innerHTML = renderCarrito();

      if (pagination) {
        pagination.attachEvents();
      }
    });
  });
}

// Localiza la función asignarEventosCompra en main.js
function asignarEventosCompra() {
  document.querySelectorAll(".btn-add").forEach((btn) => {
    btn.onclick = (e) => {
      const id = e.currentTarget.dataset.id;
      let carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];

      const producto = productosData.find((p) => String(p.id) === String(id));
      if (!producto) return;

      // Buscamos si seleccionó talla en el selector del catálogo
      const select = document.querySelector(`.talla-select[data-id="${id}"]`);
      const tallaSeleccionada =
        select && select.value !== "" ? select.value : null;

      // CAMBIO CLAVE: Si no hay talla, la cantidad DEBE ser 0
      const nuevoItem = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        url: producto.url,
        talla: tallaSeleccionada,
        cantidad: tallaSeleccionada ? 1 : 0, // Cantidad 0 si la talla es null
      };

      // Validar si ya existe la misma combinación id+talla
      const yaExiste = carritoActual.some(
        (p) =>
          String(p.id) === String(id) &&
          String(p.talla) === String(tallaSeleccionada),
      );

      if (yaExiste) {
        Modal.show("Este producto ya está en el carrito.");
        return;
      }

      carritoActual.push(nuevoItem);
      localStorage.setItem("carrito", JSON.stringify(carritoActual));
      actualizarContadorCarrito();
      Modal.show(`"${producto.nombre}" agregada al carrito.`);
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
    toggleBtn.textContent = "Modo Claro";
  } else {
    toggleBtn.textContent = "Modo Oscuro";
  }

  // 🔹 Evento click
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const modoActivo = document.body.classList.contains("dark");

    localStorage.setItem("modoOscuro", modoActivo);

    // Cambiar texto dinámicamente
    toggleBtn.textContent = modoActivo ? "Modo Claro" : "Modo Oscuro";
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
        const selectTalla = container.querySelector(
          `.select-talla-dinamica[data-id="${id}"]`,
        );
        const inputCant = container.querySelector(
          `.input-cantidad-dinamica[data-id="${id}"]`,
        );

        const talla = selectTalla ? selectTalla.value : null;
        const cantidad = inputCant ? parseInt(inputCant.value) : 1;

        if (!talla) {
          Modal.show("Por favor, selecciona una talla.");
          return;
        }

        let carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];

        // Validar si la talla ya existe para este producto [cite: 387, 391]
        const existeTalla = carritoActual.some(
          (p) =>
            String(p.id) === String(id) && String(p.talla) === String(talla),
        );

        if (existeTalla) {
          Modal.show(`La talla ${talla} ya está en el listado.`);
          return;
        }

        // Buscar datos originales del producto [cite: 379]
        const productoOriginal = productosData.find(
          (p) => String(p.id) === String(id),
        );
        if (!productoOriginal) return;

        const nuevoItem = {
          id: productoOriginal.id,
          nombre: productoOriginal.nombre,
          precio: productoOriginal.precio,
          url: productoOriginal.url,
          talla: talla,
          cantidad: cantidad,
        };

        // --- LÓGICA PARA MANTENER LA POSICIÓN ---
        // Buscamos el primer elemento que coincida con este ID (para saber dónde está la tarjeta)
        const indiceOriginal = carritoActual.findIndex(
          (p) => String(p.id) === String(id),
        );

        if (indiceOriginal !== -1) {
          // Si el item encontrado no tiene talla (fue agregado vacío del catálogo), lo reemplazamos
          if (carritoActual[indiceOriginal].talla === null) {
            carritoActual[indiceOriginal] = nuevoItem;
          } else {
            // Si ya tiene tallas, insertamos la nueva después de la última talla de ese mismo ID
            const ultimoIndiceMismoID = carritoActual.findLastIndex(
              (p) => String(p.id) === String(id),
            );
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
      // --- LÓGICA ELIMINAR TALLA ESPECÍFICA ---

      const btnEliminarTalla = e.target.closest(".btn-eliminar-talla");

      if (btnEliminarTalla) {
        const id = btnEliminarTalla.dataset.id;
        const talla = btnEliminarTalla.dataset.talla;

        Modal.confirm(
          `¿Quieres eliminar la talla <strong>${talla}</strong>?`,
          () => {
            let carritoActual =
              JSON.parse(localStorage.getItem("carrito")) || [];

            // 1. Eliminar solo esa talla específica
            carritoActual = carritoActual.filter(
              (p) =>
                !(
                  String(p.id) === String(id) &&
                  String(p.talla) === String(talla)
                ),
            );

            // 2. Verificar si aún quedan tallas del producto
            const todaviaTieneTallas = carritoActual.some(
              (p) => String(p.id) === String(id),
            );

            // 3. Si era la última talla, mantener la card visible
            if (!todaviaTieneTallas) {
              const productoOriginal = productosData.find(
                (p) => String(p.id) === String(id),
              );

              if (productoOriginal) {
                carritoActual.push({
                  ...productoOriginal,
                  talla: null,
                  cantidad: 0,
                });
              }
            }

            // 4. Guardar y refrescar vista
            localStorage.setItem("carrito", JSON.stringify(carritoActual));

            container.innerHTML = renderCarrito();
            if (pagination) pagination.attachEvents();
          },
          {
            confirmText: "Sí",
            cancelText: "No",
            title: "¿Quieres eliminar la talla?",
          },
        );
      }

      // Lógica boton editar
      // --- LÓGICA BOTÓN EDITAR (SOLUCIÓN DEFINITIVA) ---
      const btnEditar = e.target.closest(".btn-editar-talla");

      if (btnEditar) {
        const id = btnEditar.dataset.id;
        const talla = btnEditar.dataset.talla;

        // 1. Obtener la data más reciente del LocalStorage [cite: 358]
        const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
        const itemActual = carritoActual.find(
          (p) =>
            String(p.id) === String(id) && String(p.talla) === String(talla),
        );

        if (itemActual) {
          const mensajeHtml = `
            <p>Modificar cantidad para la talla <strong>${talla}</strong>:</p>
            <input type="number" id="input-nueva-cant" class="form-control text-center mx-auto" 
                   value="${itemActual.cantidad}" min="1" style="width: 100px;">
        `;

          // 2. Mostrar el modal con autoClose en false para evitar que desaparezca
          Modal.show(mensajeHtml, "Modificar talla", false, "Guardar");

          // 3. Capturamos el botón del modal manualmente para asegurar el evento
          const btnGuardarModal = document.getElementById("modal-close");

          if (btnGuardarModal) {
            btnGuardarModal.onclick = (event) => {
              event.preventDefault(); // Evitamos cualquier comportamiento por defecto

              const input = document.getElementById("input-nueva-cant");
              const nuevaCant = parseInt(input.value);

              if (!isNaN(nuevaCant) && nuevaCant > 0) {
                // Volvemos a leer el storage para evitar colisiones de datos
                let carritoData =
                  JSON.parse(localStorage.getItem("carrito")) || [];

                // Actualizamos el registro específico [cite: 359-361]
                carritoData = carritoData.map((p) => {
                  if (
                    String(p.id) === String(id) &&
                    String(p.talla) === String(talla)
                  ) {
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
                  if (
                    typeof pagination !== "undefined" &&
                    pagination.attachEvents
                  ) {
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

      const btnPagar = e.target.closest("#btn-pagar-pedido");

      if (btnPagar) {
        mostrarResumenPago();
      }

      function mostrarResumenPago() {
        const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
        const itemsValidos = carritoActual.filter((p) => p.talla !== null);

        if (itemsValidos.length === 0) {
          Modal.show("No hay productos con talla seleccionada.");
          return;
        }

        const subtotal = itemsValidos.reduce(
          (acc, p) => acc + p.precio * p.cantidad,
          0,
        );

        const despacho = 7990;

        // Calcular neto e IVA correctamente
        const neto = Math.round(subtotal / 1.19);
        const iva = subtotal - neto;

        // Total final (NO se vuelve a sumar IVA)
        const total = subtotal + despacho;

        const html = `
        <div style="width:800px; max-width:90vw; margin:0 auto;">

            <h4 class="mb-4 fw-bold text-center ">Resumen de Compra</h4>
${itemsValidos
  .map(
    (p) => `
    <div style="
        display:flex;
        gap:15px;
        margin:0 auto 20px auto;
        border-bottom:1px solid #eee;
        padding-bottom:15px;
        max-width:600px;
        align-items:center;
    ">
        
        <img src="${p.url}" 
             style="width:90px; height:90px; object-fit:contain;">

        <div style="flex:1;">
            <h6 class="mb-1">${p.nombre}</h6>
            <small class="text-muted">
                Talla: ${p.talla} | Cantidad: ${p.cantidad}
            </small>
            <div class="fw-bold mt-1">
                $${(p.precio * p.cantidad).toLocaleString("es-CL")}
            </div>
        </div>
    </div>
`,
  )
  .join("")}

            <hr>

            <div style="text-align:right;">
                <div>Subtotal: <strong>$${subtotal.toLocaleString("es-CL")}</strong></div>
                <div>IVA (19%): <strong>$${iva.toLocaleString("es-CL")}</strong></div>
                <div>Despacho: <strong>$${despacho.toLocaleString("es-CL")}</strong></div>
                <h5 class="mt-2">Total: $${total.toLocaleString("es-CL")}</h5>
            </div>

        </div>
    `;

        Modal.show(html, "", false, "Realizar Pago", "modal-pago-grande");

        setTimeout(() => {
          const btnRealizarPago = document.getElementById("modal-close");

          if (!btnRealizarPago) return;

          btnRealizarPago.onclick = (e) => {
            e.preventDefault();

            const modal = document.getElementById("custom-modal");
            if (modal) modal.remove();

            mostrarFormularioPago();
          };
        }, 50);
      }

      function mostrarFormularioPago() {
        const html = `
   <div style="max-width:600px; text-align:left;">

      <h4 class="mb-4 text-center">Formulario de Pago</h4>

      <div class="mb-3">
         <label>Nombre</label>
         <input type="text" id="pago-nombre" class="form-control">
      </div>

      <div class="mb-3">
         <label>RUT</label>
         <input type="text" id="pago-rut" class="form-control" maxlength="9">
      </div>

      <div class="mb-3">
         <label>Correo Electrónico</label>
         <input type="email" id="pago-correo" class="form-control">
      </div>

      <div class="mb-3">
         <label>Dirección</label>
         <input type="text" id="pago-direccion" class="form-control" maxlength="50">
      </div>

      <div class="mb-3">
         <label>Banco</label>
         <select id="pago-banco" class="form-select">
            <option value="">Seleccionar banco</option>
            <option>Banco Estado</option>
            <option>Banco de Chile</option>
            <option>BCI</option>
            <option>Santander</option>
            <option>Scotiabank</option>
         </select>
      </div>

      <div class="mb-3">
         <label>Número de Cuenta</label>
         <input type="text" id="pago-cuenta" class="form-control"
                maxlength="19"
                placeholder="0000-0000-0000-0000">
      </div>

   </div>
   `;

        Modal.show(html, "", false, "Pagar", "modal-pago-formulario");

        setTimeout(() => activarValidacionPago(), 50);
      }

      function activarValidacionPago() {
        const btnPagar = document.getElementById("modal-close");

        const nombre = document.getElementById("pago-nombre");
        const rut = document.getElementById("pago-rut");
        const correo = document.getElementById("pago-correo");
        const direccion = document.getElementById("pago-direccion");
        const banco = document.getElementById("pago-banco");
        const cuenta = document.getElementById("pago-cuenta");

        // Formato automático cuenta
        cuenta.addEventListener("input", (e) => {
          let valor = e.target.value.replace(/\D/g, "").substring(0, 16);
          valor = valor.match(/.{1,4}/g)?.join("-") || valor;
          e.target.value = valor;
        });

        btnPagar.onclick = () => {
          let valido = true;

          [nombre, rut, correo, direccion, banco, cuenta].forEach((c) => {
            c.style.border = "";
          });

          // Nombre obligatorio
          if (nombre.value.trim() === "") {
            nombre.style.border = "2px solid red";
            valido = false;
          }

          // RUT: 8 números + número o K
          const rutRegex = /^[0-9]{8}[0-9kK]$/;
          if (!rutRegex.test(rut.value)) {
            rut.style.border = "2px solid red";
            valido = false;
          }

          // Email básico
          if (!correo.value.includes("@")) {
            correo.style.border = "2px solid red";
            valido = false;
          }

          // Dirección alfanumérica max 50
          const dirRegex = /^[a-zA-Z0-9\s#-]{1,50}$/;
          if (!dirRegex.test(direccion.value)) {
            direccion.style.border = "2px solid red";
            valido = false;
          }

          // Banco obligatorio
          if (banco.value === "") {
            banco.style.border = "2px solid red";
            valido = false;
          }

          // Cuenta 16 dígitos
          const cuentaNumeros = cuenta.value.replace(/-/g, "");
          if (cuentaNumeros.length !== 16) {
            cuenta.style.border = "2px solid red";
            valido = false;
          }

          if (!valido) {
            Modal.show("Datos incorrectos", "Error", true);
            return;
          }

          // TODO OK
          Modal.show("Pago realizado", "Éxito", true);

          localStorage.removeItem("carrito");

          setTimeout(() => {
            window.location.hash = "/";
          }, 1500);
        };
      }
    });
  }
}

iniciarApp();
