/* contador de visitas simple: suma 1 por visita y lo guarda en el navegador
   (es por navegador, no un total global de todos los visitantes) */
(function () {
	var n = 41;
	try {
		n = parseInt(localStorage.getItem("hits") || "41", 10) + 1;
		localStorage.setItem("hits", String(n));
	} catch (e) {}
	var el = document.getElementById("hits");
	if (el) {
		el.textContent = String(n).padStart(5, "0");
	}
})();
