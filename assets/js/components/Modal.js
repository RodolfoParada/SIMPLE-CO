export class Modal {
    static show(message) {

        const existing = document.getElementById("custom-modal");
        if (existing) existing.remove();

        const modalHTML = `
            <div id="custom-modal"
                 class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                 style="background: rgba(0,0,0,0.5); z-index: 2000;">

                <div class="bg-white p-4 rounded shadow text-center"
                     style="min-width: 300px; max-width: 400px;">

                    <h5 class="mb-3">Producto agregado</h5>
                    <p>${message}</p>

                    <button class="btn btn-primary mt-3" id="modal-close">
                        Aceptar
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHTML);

        document.getElementById("modal-close").onclick = () => {
            document.getElementById("custom-modal").remove();
        };

        setTimeout(() => {
            const modal = document.getElementById("custom-modal");
            if (modal) modal.remove();
        }, 2000);
    }
}