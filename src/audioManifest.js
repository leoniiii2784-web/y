// ════════════════════════════════════════════════════════════════
// AUDIO MANIFEST — estructura lista, archivos pendientes.
// ════════════════════════════════════════════════════════════════
// El brief pide dejar la estructura preparada para sonido/música
// (prioridad alta) pero la fuente de audio libre de derechos todavía
// no está definida (ver punto abierto #3 del brief).
//
// Cómo activar el audio real:
//   1. Conseguir los archivos (banco de audio libre de derechos).
//   2. Copiarlos a assets/audio/sfx/ o assets/audio/music/ con
//      exactamente el nombre de archivo listado abajo.
//   3. Recargar — no hay que tocar código. SoundManager detecta en
//      caliente qué claves cargaron y reproduce solo esas; si un
//      archivo falta, esa key simplemente queda en silencio.
export const SFX_MANIFEST = {
  jump:      'assets/audio/sfx/jump.mp3',
  move:      'assets/audio/sfx/move.mp3',
  stomp:     'assets/audio/sfx/stomp.mp3',      // saltar sobre la competencia
  hit:       'assets/audio/sfx/hit.mp3',        // recibir contacto de la competencia
  cloud:     'assets/audio/sfx/cloud.mp3',      // presionar una nube
  answer:    'assets/audio/sfx/answer.mp3',     // recibir respuesta en el diálogo
  uiSelect:  'assets/audio/sfx/ui_select.mp3',
};

// Música ambiental — idealmente distinta por escenario (bodega,
// fábrica, retail). Hoy los 3 clientes comparten el fondo de fábrica
// aprobado (ver data.js BACKGROUNDS), así que comparten pista
// temporalmente; cuando lleguen los otros 2 fondos, agregar sus
// pistas correspondientes aquí.
export const MUSIC_MANIFEST = {
  warehouse: 'assets/audio/music/warehouse.mp3',
  factory: 'assets/audio/music/factory.mp3',
  retail: 'assets/audio/music/retail.mp3',
  menu: 'assets/audio/music/menu.mp3',
};
