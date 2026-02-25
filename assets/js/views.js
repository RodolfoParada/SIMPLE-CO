export const Views = {

    catalogo: (productos, paginationHTML) => `
        <h2 class="text-center mb-4">Nuestra Colección</h2>

        <div class="row g-4">
            ${productos.map(p => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${p.url}" 
                             class="card-img-top p-3" 
                             style="height:300px; object-fit:contain;">

                        <div class="card-body text-center">
                            <h5>${p.nombre}</h5>
                            <p>${p.color}</p>
                            <p class="fw-bold">$ ${p.precio.toLocaleString('es-CL')}</p>

                            <button class="btn btn-dark w-100 btn-add" 
                                    data-id="${p.id}">
                                Comprar
                            </button>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>

        ${paginationHTML}
    `,

    carrito: (carrito) => `
        <h2>Carrito</h2>
        ${carrito.length === 0 
            ? "<p>No hay productos en el carrito</p>"
            : carrito.map(p => `
                <div class="border p-2 mb-2">
                    ${p.nombre} - $${p.precio.toLocaleString('es-CL')}
                </div>
            `).join("")
        }
    `
};