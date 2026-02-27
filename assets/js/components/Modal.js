export class Modal {
    static show(
    message,
    title = "Producto agregado",
    autoClose = true,
    confirmText = "Aceptar"
) {

    const existing = document.getElementById("custom-modal");
    if (existing) existing.remove();

    const modalHTML = `
        <div id="custom-modal" class="custom-modal-overlay">

            <div class="custom-modal-box" style="position:relative;">

                <!-- BOTÓN X -->
                <button id="modal-close-x"
                    style="position:absolute; top:10px; right:15px;
                           border:none; background:none;
                           font-size:20px; cursor:pointer;">
                    ✕
                </button>

                <h5>${title}</h5>

                <div class="modal-body-content">
                    ${message}
                </div>

                <button class="custom-modal-btn" id="modal-close">
                    ${confirmText}
                </button>

            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("custom-modal");

    // Botón principal
    document.getElementById("modal-close").onclick = () => {
        modal.remove();
    };

    // Botón X
    document.getElementById("modal-close-x").onclick = () => {
        modal.remove();
    };

    // Auto cierre opcional
    if (autoClose) {
        setTimeout(() => {
            if (modal) modal.remove();
        }, 9000);
    }
}

     static confirm(message, onConfirm) {

        const existing = document.getElementById("custom-modal");
        if (existing) existing.remove();

        const modalHTML = `
            <div id="custom-modal" class="custom-modal-overlay">
                <div class="custom-modal-box">
                    <h5>Confirmación</h5>
                    <p>${message}</p>

                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                        <button class="custom-modal-btn" id="modal-cancel">
                            Cancelar
                        </button>
                        <button class="custom-modal-btn" id="modal-confirm">
                            Eliminar
                        </button>
                    </div>
                    
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHTML);

        document.getElementById("modal-cancel").onclick = () => {
            document.getElementById("custom-modal").remove();
        };

        document.getElementById("modal-confirm").onclick = () => {
            onConfirm();
            document.getElementById("custom-modal").remove();
        };
    }

    
}