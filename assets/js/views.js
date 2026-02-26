// views.js
export const Views = {
    // Se mantiene la estructura de catálogo original [cite: 479]
    catalogo: (productos, paginationHTML) => `
        <h2 class="text-center mb-4 text-uppercase">Nuestra Colección</h2>
        <div class="row g-4">
            ${productos.map(p => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="${p.url}" class="producto-img img-fluid card-img-top p-3" 
                             style="height:300px; object-fit:contain;" alt="${p.nombre}">
                        <div class="card-body text-center">
                            <h5 class="fw-bold">${p.nombre}</h5>
                            <p class="text-muted small">${p.color}</p>
                            <p class="fw-bold text-primary fs-5">$ ${p.precio.toLocaleString('es-CL')}</p>
                            <button class="btn btn-dark w-100 btn-add rounded-pill" data-id="${p.id}">
                                <i class="bi bi-cart-plus me-2"></i>Comprar
                            </button>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
        <div class="mt-5">${paginationHTML}</div>
    `,

carrito: (carrito) => {
    if (!carrito || carrito.length === 0) {
        return `
            <div class="text-center py-5">
                <h2 class="mb-4">Carrito</h2>
                <p class="alert alert-info">No hay productos seleccionados.</p>
                <a href="/" class="btn btn-dark" data-link>Volver al Catálogo</a>
            </div>
        `;
    }

    // Agrupamos por ID para mostrar una sola card por modelo de polera
    const productosUnicos = [...new Map(carrito.map(item => [item.id, item])).values()];
    const totalGeneral = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

    return `
        <h2 class="mb-4 fw-bold">Gestión de Pedido</h2>
        <div class="row">
            <div class="col-lg-8">
                ${productosUnicos.map(p => {
                    // Obtenemos todas las tallas ya agregadas para este ID
                    const tallasAgregadas = carrito.filter(item => item.id === p.id && item.talla !== null);
                    
                    return `
                    <div class="card mb-4 shadow-sm border-0">
                      <button 
                            class="btn btn-sm btn-danger btn-eliminar position-absolute top-0 end-0 m-2"
                            data-id="${p.id}"
                            data-talla="${p.talla}">
                            🗑
                        </button>
                        <div class="row g-0">
                            <div class="col-md-3 bg-light d-flex align-items-center justify-content-center p-3">
                                <img src="${p.url}" class="img-fluid rounded" style="max-height: 120px; object-fit: contain;">
                            </div>
                            <div class="col-md-9">
                                <div class="card-body">
                                    <h5 class="fw-bold">${p.nombre}</h5>
                                    <p class="text-muted small">Precio Unitario: $${p.precio.toLocaleString('es-CL')}</p>
                                    
                                    <div class="row g-2 align-items-end border p-3 rounded bg-white mb-3">
                                        <div class="col-4">
                                            <label class="small fw-bold">Talla:</label>
                                            <select class="form-select form-select-sm select-talla-dinamica" data-id="${p.id}">
                                                <option value="" selected disabled>Elegir...</option>
                                                <option value="XS">XS</option>
                                                <option value="S">S</option>
                                                <option value="M">M</option>
                                                <option value="L">L</option>
                                                <option value="XL">XL</option>
                                                <option value="XXL">XXL</option>
                                            </select>
                                        </div>
                                        <div class="col-3">
                                            <label class="small fw-bold">Cant:</label>
                                            <input type="number" class="form-control form-control-sm input-cantidad-dinamica" 
                                                   data-id="${p.id}" id="input-qty-${p.id}" value="1" min="1">
                                        </div>
                                        <div class="col-5">
                                            <button class="btn btn-sm btn-dark w-100 btn-confirmar-talla" data-id="${p.id}">
                                                <i class="bi bi-plus-circle me-1"></i> Agregar Talla
                                            </button>
                                        </div>
                                    </div>

                                    <div class="listado-tallas-agregadas">
                                        ${tallasAgregadas.length > 0 ? `
                                            <div class="row g-0 py-2 border-bottom fw-bold small text-muted">
                                                <div class="col-3">Talla</div>
                                                <div class="col-3 text-center">Unidades</div>
                                                <div class="col-4 text-end">Subtotal</div>
                                                <div class="col-2 text-end"></div>
                                            </div>
                                        ` : ''}
                                        
                                        ${tallasAgregadas.map(t => `
                                            <div class="row g-0 py-2 border-bottom align-items-center">
                                                <div class="col-3"><span class="badge bg-secondary">${t.talla}</span></div>
                                                <div class="col-3 text-center">${t.cantidad}</div>
                                                <div class="col-4 text-end fw-bold">$${(t.precio * t.cantidad).toLocaleString('es-CL')}</div>
                                                <div class="col-2 text-end">
                                                    <button class="btn btn-sm text-danger border-0 btn-eliminar-talla" 
                                                            data-id="${t.id}" data-talla="${t.talla}">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        `).join("")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                }).join("")}
            </div>

            <div class="col-lg-4">
                <div class="card shadow-sm border-0 sticky-top" style="top: 20px;">
                    <div class="card-body p-4 text-center">
                        <h4 class="mb-4 fw-bold">TOTAL A PAGAR</h4>
                        <hr>
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <span class="text-muted">Total:</span>
                            <span class="h3 mb-0 text-primary fw-bold">$${totalGeneral.toLocaleString('es-CL')}</span>
                        </div>
                        <button class="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow-sm">
                            PAGAR PEDIDO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
};
