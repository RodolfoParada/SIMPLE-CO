export class Router {

   constructor(rutas, containerId) {
       this.rutas = rutas;
       this.container = document.getElementById(containerId);
       this._loadInitialRoute();
   }

   navegar(path) {
       window.history.pushState({}, "", path);
       this._render(path);
   }

   _render(path) {
       const renderVista = this.rutas[path] || this.rutas["/"];
       this.container.innerHTML = renderVista();

       const evento = new CustomEvent("vistaCargada", { detail: { path } });
       document.dispatchEvent(evento);
   }

   _loadInitialRoute() {

       window.addEventListener("popstate", () => {
           this._render(window.location.pathname);
       });

       document.addEventListener("click", e => {
           if (e.target.matches("[data-link]")) {
               e.preventDefault();
               this.navegar(e.target.getAttribute("href"));
           }
       });
   }
}