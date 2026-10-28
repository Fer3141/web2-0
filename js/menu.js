/* ============================================
   menu.js  -  el menu del sitio, en un solo lugar

   Hay UN solo menu (columna izquierda), con forma de arbol de
   carpetas que se abren y cierran ([+] / [-]). No hay submenus.

   COMO EDITARLO:
   - El arbol esta en MENU, mas abajo. Cada nodo es:
       carpeta:  { folder: "Nombre", children: [ ...mas nodos... ] }
       enlace:   { href: "pagina.html", texto: "Texto" }
   - Los href se escriben SIEMPRE relativos a la raiz del sitio
     (ej: "herramientas/jenkins.html", "DevSecOps/overview.html"). Si la
     pagina actual esta en una subcarpeta, menu.js les antepone "../" solo.
   - Para agregar una pagina: un { href, texto } en la carpeta que
     corresponda de MENU.
   - Las carpetas arrancan cerradas; la de la pagina que estás viendo
     se abre sola.

   El header (arriba de todo) trae la marca, que sale de MARCA, y la
   barra (INICIO / SOBRE MI / ...), que sale de BARRA. El footer (abajo
   de todo) sale de PIE. En el HTML los huecos son solo tres:
     <header data-header></header>
     <div class="menu-lateral" data-menu></div>
     <footer data-footer></footer>

   Nota: si el navegador tiene JavaScript desactivado, el menu no
   aparece. Para un cuaderno de apuntes personal es un trato justo.
   ============================================ */

(function () {
  "use strict";

  /* la marca del sitio (arriba de todo). Se cambia SOLO aca y vale
     para todas las paginas. */
  var MARCA = "⭐ Mis Apuntes IT";

  /* el texto del footer (abajo de todo). Tambien se cambia SOLO aca. */
  var PIE = "Maria 2026";

  /* barra horizontal de arriba (paginas "de servicio") */
  var BARRA = [
    { href: "index.html", texto: " 🏠 INICIO" },
    { href: "sobre-mi.html", texto: "SOBRE MI" },
    { href: "enlaces.html", texto: "ENLACES" },
    { href: "test.html", texto: "TEST" },
  ];

  /* el arbol del menu lateral: carpetas con enlaces a paginas.
     (una carpeta tambien puede llevar sub-carpetas: ver dibujarNodo) */
  var MENU = [
    {
      folder: "DevSecOps",
      children: [
        { href: "DevSecOps/overview.html", texto: "Overview" },
        { href: "DevSecOps/triadaCIA.html", texto: "Tríada CIA" },
        { href: "DevSecOps/DAST_SAST_SCA.html", texto: "SAST, DAST y SCA" },
      ],
    },
    {
      folder: "Herramientas",
      children: [
        { href: "herramientas/jenkins.html", texto: "Jenkins" },
        { href: "herramientas/docker.html", texto: "🐳 Docker" },
        { href: "herramientas/aws.html", texto: "AWS" },
      ],
    },
    {
      folder: "Proyectos",
      children: [{ href: "proyectos/charlemos.html", texto: "Charlemos" }],
    },
    {
      folder: "Meta",
      children: [{ href: "certificaciones.html", texto: "Certificaciones" }],
    },
  ];

  /* archivo actual, ej "overview.html" (o "index.html" si la URL es "/") */
  var actual = location.pathname.split("/").pop() || "index.html";

  /* prefijo para los enlaces: si estamos dentro de una subcarpeta de un
     nivel (DevSecOps/ o herramientas/), hay que subir con "../".
     Los href de MENU/BARRA se escriben relativos a la raiz. */
  var base = /\/(?:DevSecOps|herramientas|proyectos)\//.test(location.pathname) ? "../" : "";

  /* ultimo segmento de un href, sin carpeta ni #ancla: "a/b.html#x" -> "b.html" */
  function archivo(href) {
    return href.split("/").pop().split("#")[0];
  }

  /* ¿este nodo, o alguno de sus descendientes, apunta a la pagina actual? */
  function tocaPaginaActual(nodo) {
    if (nodo.href && archivo(nodo.href) === actual) return true;
    return (nodo.children || []).some(tocaPaginaActual);
  }

  function crearEnlace(href, texto) {
    var a = document.createElement("a");
    a.href = base + href;
    a.textContent = texto;
    if (archivo(href) === actual) a.className = "activo";
    return a;
  }

  /* dibuja un nodo del arbol y devuelve el <li> que lo contiene */
  function dibujarNodo(nodo) {
    var li = document.createElement("li");

    /* hoja: un enlace simple */
    if (!nodo.children) {
      li.appendChild(crearEnlace(nodo.href, nodo.texto));
      return li;
    }

    /* carpeta: un <details> */
    var det = document.createElement("details");
    if (tocaPaginaActual(nodo)) det.open = true;

    var sum = document.createElement("summary");
    if (nodo.href) {
      /* la carpeta ademas es una pagina: el nombre es un enlace.
         stopPropagation para que al clickear el texto NO se pliegue. */
      var a = crearEnlace(nodo.href, nodo.folder);
      a.addEventListener("click", function (e) {
        e.stopPropagation();
      });
      sum.appendChild(a);
    } else {
      sum.textContent = nodo.folder;
    }
    det.appendChild(sum);

    var ul = document.createElement("ul");
    nodo.children.forEach(function (hijo) {
      ul.appendChild(dibujarNodo(hijo));
    });
    det.appendChild(ul);

    li.appendChild(det);
    return li;
  }

  /* el header COMPLETO: la marca (titulo) + la barra de enlaces.
     Con escribir <header data-header></header> en la pagina alcanza. */
  function pintarHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) return;

    /* franja de arriba con la marca; lo que la pagina haya puesto dentro
       del <header> (ej: un subtitulo) queda debajo de la marca */
    var cabecera = document.createElement("div");
    cabecera.className = "cabecera";
    while (header.firstChild) cabecera.appendChild(header.firstChild);

    var p = document.createElement("p");
    p.className = "marca";
    p.textContent = MARCA;
    cabecera.insertBefore(p, cabecera.firstChild);

    /* la barra de enlaces */
    var barra = document.createElement("nav");
    barra.className = "barra-nav";
    barra.setAttribute("aria-label", "Principal");
    BARRA.forEach(function (item) {
      var a = crearEnlace(item.href, item.texto);
      a.textContent = "[ " + item.texto + " ]";
      barra.appendChild(a);
    });

    header.appendChild(cabecera);
    header.appendChild(barra);
  }

  function pintarMenu() {
    var caja = document.querySelector("[data-menu]");
    if (!caja) return;

    var titulo = document.createElement("p");
    titulo.className = "menu-titulo";
    titulo.textContent = "Menu";

    var nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Temas");

    var ul = document.createElement("ul");
    ul.className = "menu-arbol";
    MENU.forEach(function (nodo) {
      ul.appendChild(dibujarNodo(nodo));
    });
    nav.appendChild(ul);

    /* se insertan ANTES de lo que ya haya dentro del div
       (ej: la cajita .estado de test.html se mantiene abajo) */
    caja.insertBefore(nav, caja.firstChild);
    caja.insertBefore(titulo, caja.firstChild);
  }

  function pintarFooter() {
    var footer = document.querySelector("[data-footer]");
    if (!footer) return;
    footer.className = "pie";
    footer.textContent = PIE;
  }

  function init() {
    pintarHeader();
    pintarMenu();
    pintarFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
