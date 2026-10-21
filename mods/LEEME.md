# Carpeta de mods

Cada mod va en SU PROPIA carpeta: `mods/<id-del-mod>/`.

```
mods/
├─ index.json              { "mods": ["mi-mod", "otro-mod"] }
└─ mi-mod/
   ├─ index.json           datos del mod (obligatorio)
   ├─ assets/              portada, fondo, video, música de fondo, audio e imágenes de canciones, iconos
   ├─ musica/              mapas .oks
   ├─ scripts/             mecánicas nuevas (.js)
   ├─ css/                 estilos extra
   └─ img/ sounds/ js/ …   archivos que REEMPLAZAN a los del juego (misma ruta relativa)
```

## index.json del mod
| Campo | Qué hace |
|---|---|
| `nombre`, `creador`, `version`, `descripcion`, `etiquetas` | Datos que se ven en la pantalla Mods |
| `portada`, `fondo`, `video`, `bgm` | Medios del mod (rutas dentro del mod). Si no las pones se buscan en `assets/portada.*`, `fondo.*`, `video.*`, `musica.*` |
| `mecanicas` | Iconos de mecánicas: `"hold"`, `"rebote"`, `"bomba"`, `"cambio"`, `"velocidad"`, `"texto"`, `"fantasma"` o un objeto `{id, nombre, descripcion, icono}` para una propia |
| `dificultades` | Pestañas de dificultad nuevas |
| `canciones` | `[{ "archivo": "demo.oks" }]` (también se detectan los .oks de `musica/`) |
| `scripts`, `css` | Archivos extra (también se detectan las carpetas) |
| `archivos` | Lista de archivos que reemplazas. Si la pones (aunque sea `[]`) el juego no tiene que comprobarlos uno a uno: carga más rápido |
| `activo: false` | Oculta el mod por completo |

## Mapa .oks
Cada nota: `[tiempo_ms, columna, { extras }]` — extras: `hold` (ms), `tag` (`"rebote"`, `"bomba"` o tu mecánica), `cambio: [tiempo, columnaNueva]`.
El audio/fondo/video del mapa se buscan en `assets/` (campos `audio`, `fondo`, `video` del mapa).

## Mecánicas propias (script)
```js
OKAOS.mechanics.register("pulso", {
  spawn(note, el) {}, update(note, nowMs) {}, hit(note, info) { return false; }, miss(note) {}
});
```
La nota recibe la clase CSS `tag-pulso`. Mira `ejemplo-mecanicas/` como plantilla completa.
