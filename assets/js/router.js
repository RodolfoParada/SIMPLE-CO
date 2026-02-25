export class Router {

  constructor(rutas, containerId) {
      this.rutas = rutas;
      this.container = document.getElementById(containerId);
      this._initEvents();
  }

  navegar(path) {
      window.location.hash = path;
  }

  iniciar() {
      this._renderFromHash();
  }

  _getPath() {
      return window.location.hash.slice(1) || "/";
  }

  _renderFromHash() {
      this._render(this._getPath());
  }

  _render(path) {
      const renderVista = this.rutas[path] || this.rutas["/"];
      this.container.innerHTML = renderVista();

      document.dispatchEvent(
          new CustomEvent("vistaCargada", { detail: { path } })
      );
  }

  _initEvents() {

      window.addEventListener("hashchange", () => {
          this._renderFromHash();
      });

      document.addEventListener("click", e => {
          const link = e.target.closest("[data-link]");
          if (!link) return;

          e.preventDefault();
          window.location.hash = link.getAttribute("href");
      });
  }
}