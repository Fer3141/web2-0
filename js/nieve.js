/* ================================================
   Nieve cayendo
   Crea copos (el simbolo ❄) y los hace caer con
   requestAnimationFrame. No necesita CSS aparte:
   todos los estilos se ponen desde aca.
   Se carga con  <script src="nieve.js"></script>
   antes de cerrar </body>.
   ================================================ */

(function () {

	/* si el sistema pide "menos movimiento", no dibujamos nada */
	if (window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		return;
	}

	var CANTIDAD = 10;   /* cuantos copos en pantalla */

	/* capa que contiene toda la nieve, por encima de la pagina */
	var capa = document.createElement("div");
	capa.style.position = "fixed";
	capa.style.top = "0";
	capa.style.left = "0";
	capa.style.width = "100%";
	capa.style.height = "100%";
	capa.style.pointerEvents = "none";   /* no molesta los clicks */
	capa.style.overflow = "hidden";
	capa.style.zIndex = "9999";
	document.body.appendChild(capa);

	var copos = [];

	/* crear cada copo con valores al azar */
	for (var i = 0; i < CANTIDAD; i++) {
		var el = document.createElement("div");
		el.textContent = "❄";        /* ❄ */
		el.style.position = "absolute";
		el.style.color = "#ffffff";
		el.style.userSelect = "none";
		el.style.textShadow = "0 0 3px rgba(0, 0, 0, 0.15)";

		var tam = 8 + Math.random() * 16;                 /* tamanio de letra */
		el.style.fontSize = tam + "px";
		el.style.opacity = 0.45 + (tam - 8) / 40;         /* los grandes, mas opacos */

		capa.appendChild(el);

		copos.push({
			el: el,
			x: Math.random() * window.innerWidth,
			y: Math.random() * window.innerHeight,
			velY: 0.5 + Math.random() * 1.5,     /* velocidad de caida */
			velX: -0.5 + Math.random(),          /* deriva lateral */
			giro: Math.random() * 360
		});
	}

	/* bucle de animacion: mueve cada copo un pasito por cuadro */
	function animar() {
		var ancho = window.innerWidth;
		var alto = window.innerHeight;

		for (var i = 0; i < copos.length; i++) {
			var c = copos[i];

			c.y += c.velY;
			c.x += c.velX + Math.sin(c.y / 50) * 0.5;   /* bamboleo suave */
			c.giro += 0.5;

			/* si salio por abajo, vuelve arriba en otra columna */
			if (c.y > alto) {
				c.y = -10;
				c.x = Math.random() * ancho;
			}
			/* si salio por un costado, aparece por el otro */
			if (c.x > ancho) { c.x = 0; }
			if (c.x < 0) { c.x = ancho; }

			c.el.style.transform =
				"translate(" + c.x + "px, " + c.y + "px) rotate(" + c.giro + "deg)";
		}

		requestAnimationFrame(animar);
	}

	animar();
})();
