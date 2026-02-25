export class Pagination {

    constructor({
        totalItems,
        itemsPerPage = 6,
        currentPage = 1,
        onPageChange
    }) {
        this.totalItems = totalItems;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = currentPage;
        this.onPageChange = onPageChange;
    }

    get totalPages() {
        return Math.ceil(this.totalItems / this.itemsPerPage);
    }

    paginate(data) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return data.slice(start, end);
    }

    render() {
        return `
            <div class="d-flex justify-content-center align-items-center gap-3 mt-4">

                <button 
                    class="btn btn-outline-dark  btn-prev"
                    ${this.currentPage === 1 ? "disabled" : ""}
                >
                    ←
                </button>

                <span class="fw-bold">
                    Página ${this.currentPage} de ${this.totalPages}
                </span>

                <button 
                    class="btn btn-outline-dark btn-next"
                    ${this.currentPage === this.totalPages ? "disabled" : ""}
                >
                    →
                </button>

            </div>
        `;
    }

    attachEvents() {

        const prevBtn = document.querySelector(".btn-prev");
        const nextBtn = document.querySelector(".btn-next");

        if (prevBtn) {
            prevBtn.onclick = () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.onPageChange(this.currentPage);
                }
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.onPageChange(this.currentPage);
                }
            };
        }
    }
}