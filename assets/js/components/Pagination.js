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

    paginate(items) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return items.slice(start, end);
    }

    render() {
        if (this.totalPages <= 1) return "";

        return `
            <div class="d-flex justify-content-center mt-5 gap-2">
                ${Array.from({ length: this.totalPages }, (_, i) => `
                    <button 
                        class="btn ${this.currentPage === i + 1 ? 'btn-dark' : 'btn-outline-dark'} btn-page"
                        data-page="${i + 1}">
                        ${i + 1}
                    </button>
                `).join("")}
            </div>
        `;
    }

    

    attachEvents() {
        document.querySelectorAll('.btn-page').forEach(btn => {
            btn.addEventListener("click", (e) => {
                const page = parseInt(e.target.dataset.page);
                this.currentPage = page;

                if (this.onPageChange) {
                    this.onPageChange(page);
                }
            });
        });
    }

  
}