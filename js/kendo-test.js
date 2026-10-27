$(function () {
    kendo.culture("es-ES");

    var CLAVE = "web2-0-libro-visitas";
    var idABorrar = null;

    var firmasIniciales = [
        { id: 1, nombre: "Pikachu", pokemon: "Pikachu", animo: "Feliz", fecha: "2026-08-24", mensaje: "¡Pika pika! Que linda web.", likes: 3, nota: 5 },
        { id: 2, nombre: "Mew", pokemon: "Mew", animo: "Nostalgica", fecha: "2026-08-29", mensaje: "Me recuerda a las webs de antes.", likes: 1, nota: 4 }
    ];

    function leer() {
        try {
            var guardadas = JSON.parse(localStorage.getItem(CLAVE));
            return Array.isArray(guardadas) ? guardadas : firmasIniciales;
        } catch (e) {
            return firmasIniciales;
        }
    }

    function guardar() {
        try {
            localStorage.setItem(CLAVE, JSON.stringify(firmas.data().toJSON()));
        } catch (e) { }
    }

    var plantilla = kendo.template(
        '<div class="kv-firma">' +
            '<div class="kv-firma-cabecera">' +
                '<b>#: nombre #</b>' +
                '<span class="kv-pokemon">#: pokemon || "sin pokemon" #</span>' +
                '<span class="kv-fecha" title="#: kendo.toString(fecha, \'D\') #">#: kendo.toString(fecha, "dd/MM/yyyy") #</span>' +
            '</div>' +
            '<p>#: mensaje #</p>' +
            '<div class="kv-firma-pie">' +
                '<span class="kv-animo">Animo: #: animo ## if (nota) { # &middot; <span class="kv-nota">#= "★".repeat(nota) #</span># } #</span>' +
                '<button type="button" class="kv-like" data-id="#= id #">#= likes #</button>' +
                '<button type="button" class="kv-borrar" data-id="#= id #"></button>' +
            '</div>' +
        '</div>'
    );

    var firmas = new kendo.data.DataSource({
        data: leer(),
        schema: {
            model: {
                id: "id",
                fields: {
                    nombre: { type: "string" },
                    pokemon: { type: "string" },
                    animo: { type: "string" },
                    fecha: { type: "date" },
                    mensaje: { type: "string" },
                    likes: { type: "number" },
                    nota: { type: "number" }
                }
            }
        },
        sort: { field: "fecha", dir: "desc" },
        change: function () {
            guardar();
            pintar();
        }
    });

    var aviso = $("#kvAviso").kendoNotification({
        position: { bottom: 20, right: 20 },
        autoHideAfter: 2500
    }).data("kendoNotification");

    var total = $("#kvTotal").kendoBadge({
        themeColor: "info",
        rounded: "full"
    }).data("kendoBadge");

    function contarAnimos(todas) {
        var cuenta = {};
        var comun = "-";
        $.each(todas, function (i, f) {
            cuenta[f.animo] = (cuenta[f.animo] || 0) + 1;
            if (comun === "-" || cuenta[f.animo] > cuenta[comun]) {
                comun = f.animo;
            }
        });
        return comun;
    }

    function pintarEstadisticas() {
        var todas = firmas.data();
        var sumaNotas = 0;
        var conNota = 0;
        var conPokemon = 0;
        $.each(todas, function (i, f) {
            if (f.nota) {
                sumaNotas += f.nota;
                conNota++;
            }
            if (f.pokemon) {
                conPokemon++;
            }
        });
        var promedio = conNota ? sumaNotas / conNota : 0;
        var porcentaje = todas.length ? Math.round(conPokemon * 100 / todas.length) : 0;

        barraPromedio.value(promedio);
        $("#kvPromedioTexto").text(kendo.toString(promedio, "n1") + " de 5");
        barraPokemon.value(porcentaje);
        $("#kvConPokemonTexto").text(conPokemon + " de " + todas.length);
        $("#kvAnimoComun").text(contarAnimos(todas));
    }

    function pintar() {
        var lista = $("#kvFirmas");
        var vista = firmas.view();

        total.text(firmas.data().length);
        pintarEstadisticas();

        if (!vista.length) {
            lista.html('<p class="kv-vacio">Todavia nadie firmo. ¡Se la primera!</p>');
            return;
        }

        lista.html($.map(vista, plantilla).join(""));
        lista.find(".kv-like").kendoButton({ icon: "heart", fillMode: "flat", themeColor: "error" });
        lista.find(".kv-borrar").kendoButton({ icon: "trash", fillMode: "flat" });
    }

    $("#kvPestanas").kendoTabStrip({
        tabPosition: "left",
        animation: { open: { effects: "fadeIn" } }
    }).data("kendoTabStrip").select(0);

    var barraPromedio = $("#kvPromedio").kendoProgressBar({
        min: 0,
        max: 5,
        type: "value",
        showStatus: false,
        animation: { duration: 400 }
    }).data("kendoProgressBar");

    var barraPokemon = $("#kvConPokemon").kendoProgressBar({
        min: 0,
        max: 100,
        type: "percent",
        animation: { duration: 400 }
    }).data("kendoProgressBar");

    var campoNombre = $("#kvNombre").kendoTextBox({
        placeholder: "Tu nombre",
        clearButton: true
    }).data("kendoTextBox");

    var campoMensaje = $("#kvMensaje").kendoTextArea({
        placeholder: "Deja un saludo",
        rows: 3,
        maxLength: 200,
        resize: "vertical"
    }).data("kendoTextArea");

    var deslizadorNota = $("#kvNota").kendoSlider({
        min: 1,
        max: 5,
        value: 5,
        smallStep: 1,
        largeStep: 1,
        showButtons: false,
        tooltip: { template: "#= '★'.repeat(value) #" }
    }).data("kendoSlider");

    $("#kvPokemon").kendoAutoComplete({
        dataSource: ["Bulbasaur", "Charmander", "Squirtle", "Pikachu", "Eevee", "Jigglypuff", "Meowth", "Psyduck", "Snorlax", "Mew", "Mewtwo", "Togepi"],
        filter: "startswith",
        placeholder: "Empieza a escribir...",
        clearButton: true
    });

    $("#kvAnimo").kendoDropDownList({
        dataSource: ["Feliz", "Nostalgica", "Curiosa", "Cansada", "Inspirada"],
        value: "Feliz"
    });

    $("#kvFecha").kendoDatePicker({
        value: new Date(),
        format: "dd/MM/yyyy"
    });

    $("#kvFirmar").kendoButton({ themeColor: "primary", icon: "pencil" });

    $("#kvOrden").kendoButtonGroup({
        items: [
            { text: "Nuevas", selected: true },
            { text: "Antiguas" },
            { text: "Populares" }
        ],
        select: function (e) {
            var ordenes = [
                { field: "fecha", dir: "desc" },
                { field: "fecha", dir: "asc" },
                { field: "likes", dir: "desc" }
            ];
            firmas.sort(ordenes[e.indices[0]]);
        }
    });

    var validador = $("#formVisita").kendoValidator().data("kendoValidator");

    $("#formVisita").on("submit", function (e) {
        e.preventDefault();
        if (!validador.validate()) {
            return;
        }
        var maxId = 0;
        $.each(firmas.data(), function (i, f) { maxId = Math.max(maxId, f.id); });

        firmas.add({
            id: maxId + 1,
            nombre: campoNombre.value().trim(),
            pokemon: $("#kvPokemon").data("kendoAutoComplete").value(),
            animo: $("#kvAnimo").data("kendoDropDownList").value(),
            fecha: $("#kvFecha").data("kendoDatePicker").value() || new Date(),
            mensaje: campoMensaje.value().trim(),
            likes: 0,
            nota: deslizadorNota.value()
        });
        firmas.sort(firmas.sort());

        campoNombre.value("");
        campoMensaje.value("");
        validador.hideMessages();
        aviso.show("¡Gracias por firmar!", "success");
    });

    $("#kvFirmas").on("click", ".kv-like", function () {
        var firma = firmas.get($(this).data("id"));
        firma.set("likes", firma.likes + 1);
    });

    var confirmar = $("#kvConfirmar").kendoDialog({
        title: "Borrar firma",
        width: 340,
        visible: false,
        modal: true,
        closable: true,
        actions: [
            { text: "Cancelar" },
            {
                text: "Borrar",
                primary: true,
                action: function () {
                    var firma = firmas.get(idABorrar);
                    if (firma) {
                        firmas.remove(firma);
                        aviso.show("Firma borrada", "warning");
                    }
                }
            }
        ]
    }).data("kendoDialog");

    $("#kvFirmas").on("click", ".kv-borrar", function () {
        idABorrar = $(this).data("id");
        var firma = firmas.get(idABorrar);
        confirmar.content("¿Seguro que quieres borrar la firma de <b>" + kendo.htmlEncode(firma.nombre) + "</b>?");
        confirmar.open();
    });

    $("#kvFirmas").kendoTooltip({
        filter: ".kv-fecha",
        position: "top"
    });

    firmas.read();
});
