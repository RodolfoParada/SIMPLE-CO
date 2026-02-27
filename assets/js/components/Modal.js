export class Modal {
    static show(message) {

        const existing = document.getElementById("custom-modal");
        if (existing) existing.remove();

        const modalHTML = `
            <div id="custom-modal" class="custom-modal-overlay">

                <div class="custom-modal-box">

                    <h5>Producto agregado</h5>
                    <p>${message}</p>

                    <button class="custom-modal-btn" id="modal-close">
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
        }, 10000);
    }
}