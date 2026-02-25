export class ImagenClick {

    static open(src) {

        const existing = document.getElementById("lightbox");
        if (existing) existing.remove();

        const html = `
            <div id="lightbox">
                <img src="${src}" class="lightbox-img" alt="Imagen ampliada">
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", html);

        const lightbox = document.getElementById("lightbox");

        const cerrar = () => {
            lightbox.remove();
            document.removeEventListener("keydown", handleEsc);
        };

        const handleEsc = (e) => {
            if (e.key === "Escape") {
                cerrar();
            }
        };

        // Click fuera
        lightbox.addEventListener("click", (e) => {
            if (e.target.id === "lightbox") {
                cerrar();
            }
        });

        // ESC
        document.addEventListener("keydown", handleEsc);
    }
}