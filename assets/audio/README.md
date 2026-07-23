# Audio pendiente

No hay archivos de audio en este handoff — la fuente (banco de audio libre
de derechos) todavía no está definida (ver punto abierto #3 del brief v5).

El juego ya está cableado para sonido: `src/audioManifest.js` lista las
claves y rutas esperadas, `src/soundManager.js` las carga e ignora
silenciosamente las que falten.

## Cómo activar el audio real

1. Consigue los archivos (mp3 recomendado por compatibilidad amplia).
2. Cópialos exactamente con estos nombres:

```
assets/audio/sfx/jump.mp3        — saltar
assets/audio/sfx/move.mp3        — moverse (paso)
assets/audio/sfx/stomp.mp3       — saltar sobre la competencia
assets/audio/sfx/hit.mp3         — recibir contacto de la competencia
assets/audio/sfx/cloud.mp3       — presionar una nube
assets/audio/sfx/answer.mp3      — recibir respuesta en el diálogo
assets/audio/sfx/ui_select.mp3   — navegación de UI (opcional)

assets/audio/music/warehouse.mp3 — música ambiental bodega
assets/audio/music/factory.mp3   — música ambiental fábrica
assets/audio/music/retail.mp3    — música ambiental retail
assets/audio/music/menu.mp3      — música pantalla de personalización (no cableada aún)
```

3. Recarga el juego. No hace falta tocar código.
