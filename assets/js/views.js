export const Views = {

    catalogo: (productos, paginationHTML) => `
        <h2 class="text-center mb-4">Nuestra Colección</h2>

        <div class="row g-4">
            ${productos.map(p => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${p.url}" 
                             class="producto-img img-fluid card-img-top p-3" 
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


carrito: (carrito) => {

    if (!carrito || carrito.length === 0) {
        return `
            <h2 class="mb-4">Carrito</h2>
            <p>No hay productos en el carrito</p>
        `;
    }

    const totalGeneral = carrito.reduce((acc, p) => {
        return acc + (p.precio * p.cantidad);
    }, 0);

    return `
        <h2 class="mb-4">Carrito</h2>

        <div class="row">
            ${carrito.map(p => `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm position-relative">

                        <button 
                            class="btn btn-sm btn-danger btn-eliminar position-absolute top-0 end-0 m-2"
                            data-id="${p.id}"
                            data-talla="${p.talla}">
                            🗑
                        </button>

                        <img src="${p.url}" 
                             class="card-img-top p-3"
                             style="height:180px; object-fit:contain;"
                             alt="${p.nombre}">

                        <div class="card-body text-center">
                            <h6>${p.nombre}</h6>
                            <p>Talla: ${p.talla ?? '-'}</p>
                            <p>Cantidad: ${p.cantidad}</p>
                            <p>$${p.precio.toLocaleString('es-CL')}</p>
                            <strong>
                                $${(p.precio * p.cantidad).toLocaleString('es-CL')}
                            </strong>
                        </div>

                    </div>
                </div>
            `).join("")}
        </div>

        <hr>

        <h4 class="text-end">
            Total: $${totalGeneral.toLocaleString('es-CL')}
        </h4>
    `;
}

};