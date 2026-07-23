# PrimaVendedor v5

Juego de entrenamiento comercial tipo plataformer 2D. Migración del v4
(un solo HTML dibujado a `ctx.fillRect()`) a Phaser 3 con sprites reales
en pixel art, conservando intacta toda la lógica de negocio (arquetipos
de cliente, indicadores de rentabilidad/relación/reputación, flujo de
juego).

## Cómo correrlo localmente

Es un sitio estático (sin build step) — cualquier servidor estático sirve:

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

(Tiene que ser vía HTTP, no `file://`, porque usa ES modules y `fetch`
para cargar assets.)

## Arquitectura

Enfoque híbrido, igual que v4 pero con el canvas plano reemplazado por
Phaser:

- **Phaser 3** (`src/scenes/`) maneja únicamente la capa de plataformas:
  física, cámara, sprites, colisiones con la competencia, parallax de
  fondo y las nubes interactivas.
- **DOM/CSS** (`src/ui.js` + `css/style.css`) maneja todas las pantallas
  de flujo — personalización, alerta, tarjeta de cliente, diálogo,
  feedback, resultado, fin — igual que v4. Esto evitó reescribir toda la
  UI (ya validada) en Phaser y mantiene el texto nítido/accesible en
  cualquier resolución.
- Ambas capas se comunican por un bus de eventos minimalista
  (`src/bus.js`): Phaser avisa `reached-client`, `player-hit`,
  `game-over`; la UI llama directamente `playScene.startLevel()` /
  `stopLevel()` cuando corresponde avanzar.
- `src/state.js` centraliza el estado de partida e indicadores
  (`gs`, `applyInd`) — tanto la UI como la escena de Phaser leen/escriben
  ahí, nunca se duplica el cálculo.
- `src/data.js` — SKINS/PROFILES/CLIENTS, portado de v4 sin cambios de
  fondo en la lógica de negocio.

### Anclaje de sprites (pies a distinta altura por pose)

Los sprites (`assets/sprites/`) no tienen los pies a la misma altura de
píxel entre poses. `src/spriteManifest.js` guarda, por cada pose, el
bounding box de contenido real (no el borde del lienzo) y de ahí deriva
`footYFrac`/`centerXFrac`. Al dibujar, `anchorSprite()` aplica esas
fracciones como `origin` de la sprite en Phaser, así el mundo-x/y
siempre corresponde al punto real donde el personaje pisa — no salta al
cambiar de pose. Si se regeneran o agregan sprites, hay que recalcular
el bbox alpha de cada PNG y actualizar el manifest (cualquier editor de
imágenes que dé el bounding box de la capa con transparencia sirve).

La física (colisión con piso/plataformas/competencia) corre sobre una
caja lógica invisible (`Phaser.GameObjects.Zone` + body) de tamaño fijo;
la sprite visible solo seguí esa caja. Esto separa completamente el
"tamaño de colisión" del "tamaño de la ilustración", que es lo que hace
robusto el anclaje por bbox sin tener que sincronizar físicas.

## Decisiones tomadas para esta primera etapa (con el usuario)

- **Selector de look**: la estructura de "skins" queda lista para crecer
  (`src/data.js` → `SKINS`), pero hoy solo tiene una entrada — el único
  diseño de vendedor entregado. Se agregan más variantes empujando
  objetos nuevos a ese arreglo, sin tocar el resto del código.
- **Reporte de desempeño**: descargable desde la pantalla final. Genera
  un HTML autocontenido y legible (`src/report.js`) con el detalle de
  cada ronda de negociación por cliente, más los datos crudos embebidos
  como JSON dentro del mismo archivo — listo para una futura integración
  sin tener que rediseñar el formato.
- **Fondos**: los 3 escenarios (bodega/fábrica/retail) reutilizan hoy
  `fabrica.png` (el único aprobado). Ver `assets/backgrounds/README.md`
  para el paso exacto de reemplazo cuando lleguen los otros dos.

## Pendiente (fuera de alcance de esta etapa)

- Audio real (ver `assets/audio/README.md` — estructura lista, sin
  archivos).
- Fondos de bodega y retail en el tratamiento pixel-art aprobado (hoy
  usan el de fábrica).
- Definir destinatario/integración externa del reporte de desempeño
  (Excel/Power Automate) — hoy es solo descarga local.
- Variantes adicionales de look del vendedor.
