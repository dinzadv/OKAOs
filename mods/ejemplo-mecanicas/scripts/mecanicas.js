/* Mecánicas propias del mod "Laboratorio de Mecánicas".
   Se ejecuta en TODAS las pantallas: la lógica de juego solo corre en play/run.html.

   Una mecánica se activa poniendo  tag: "nombre"  en la nota del mapa .oks:
       [4000, 1, { tag: "pulso" }]

   Funciones opcionales de cada mecánica (todas reciben la nota como 1er argumento):
       spawn(note, el)            cuando la nota aparece
       update(note, nowMs)        en cada fotograma mientras la nota cae
       hit(note, info)            al pulsarla; devuelve true para anular el golpe normal
       miss(note)                 al fallarla; devuelve true para que NO cuente como fallo
*/
(function () {
    "use strict";

    // Pulso: el estilo se aplica desde css/pulso.css con la clase .tag-pulso
    OKAOS.mechanics.register("pulso", {
        nombre: "Pulso",
        spawn: function (note, el) {
            el.style.setProperty("--pulso-delay", (-(note.time % 500) / 1000) + "s");
        }
    });

    // Fantasma: la nota se vuelve casi invisible al acercarse al receptor
    OKAOS.mechanics.register("fantasma", {
        update: function (note, nowMs) {
            if (!note.el) return;
            const left = note.time - nowMs;
            note.el.style.opacity = String(Math.max(0.08, Math.min(1, left / 520)));
        }
    });
})();
