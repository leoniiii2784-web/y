// ════════════════════════════════════════════════════════════════
// SPRITE ANCHOR MANIFEST
// ════════════════════════════════════════════════════════════════
// Los 11 sprites vienen en un lienzo de 576×384 (reescalado desde el
// original de 1536×1024 entregado por diseño). Los pies del personaje
// NO están a la misma altura de píxel entre poses — varía según la
// pose (correr, saltar, etc.) hasta ~60px dentro del lienzo.
//
// Para que el personaje no "salte" de posición al cambiar de pose,
// cada entrada guarda el bounding box de contenido real (no el borde
// del lienzo) y derivamos:
//   - footYFrac:    fracción vertical del punto de apoyo (pies)
//   - centerXFrac:  fracción horizontal del centro del personaje
//
// Usamos esas fracciones como origin de la sprite en Phaser
// (sprite.setOrigin(centerXFrac, footYFrac)), así el mundo-x/y del
// sprite siempre corresponde al punto real donde el personaje pisa,
// sin importar cuánto padding transparente tenga cada pose.
//
// Si se regeneran/agregan sprites, recalcular este manifest con
// cualquier herramienta que dé el bounding box de contenido (alpha
// bbox) de cada PNG y actualizar los valores de abajo.

export const SPRITE_MANIFEST = {
  vendedor_idle:          { w: 576, h: 384, bboxTop: 26, bboxBottom: 367, bboxLeft: 180, bboxRight: 368, footYFrac: 0.95573, centerXFrac: 0.47569 },
  vendedor_moviendose:    { w: 576, h: 384, bboxTop: 37, bboxBottom: 343, bboxLeft: 174, bboxRight: 400, footYFrac: 0.89323, centerXFrac: 0.49826 },
  vendedor_salto:         { w: 576, h: 384, bboxTop: 31, bboxBottom: 357, bboxLeft: 185, bboxRight: 365, footYFrac: 0.92969, centerXFrac: 0.47743 },
  vendedor_golpeado:      { w: 576, h: 384, bboxTop: 64, bboxBottom: 349, bboxLeft: 158, bboxRight: 415, footYFrac: 0.90885, centerXFrac: 0.49740 },

  cliente_neutral:        { w: 576, h: 384, bboxTop: 23, bboxBottom: 359, bboxLeft: 188, bboxRight: 352, footYFrac: 0.93490, centerXFrac: 0.46875 },
  cliente_esperando:      { w: 576, h: 384, bboxTop: 24, bboxBottom: 361, bboxLeft: 190, bboxRight: 405, footYFrac: 0.94010, centerXFrac: 0.51649 },
  cliente_hablando:       { w: 576, h: 384, bboxTop: 19, bboxBottom: 377, bboxLeft: 198, bboxRight: 442, footYFrac: 0.98177, centerXFrac: 0.55556 },

  competencia_idle:       { w: 576, h: 384, bboxTop: 49, bboxBottom: 349, bboxLeft: 216, bboxRight: 351, footYFrac: 0.90885, centerXFrac: 0.49219 },
  competencia_moviendose: { w: 576, h: 384, bboxTop: 58, bboxBottom: 357, bboxLeft: 172, bboxRight: 380, footYFrac: 0.92969, centerXFrac: 0.47917 },
  competencia_salto:      { w: 576, h: 384, bboxTop: 34, bboxBottom: 365, bboxLeft: 200, bboxRight: 352, footYFrac: 0.95052, centerXFrac: 0.47917 },
  competencia_golpeado:   { w: 576, h: 384, bboxTop: 105, bboxBottom: 353, bboxLeft: 190, bboxRight: 370, footYFrac: 0.91927, centerXFrac: 0.48611 },
};

// Altura de referencia (bbox del pose "idle"/"neutral") usada para
// derivar el factor de escala de cada personaje en el juego, de modo
// que el tamaño en pantalla sea consistente entre sus 3-4 poses.
export function bboxHeightPx(key) {
  const m = SPRITE_MANIFEST[key];
  return m.bboxBottom - m.bboxTop;
}

export function bboxWidthPx(key) {
  const m = SPRITE_MANIFEST[key];
  return m.bboxRight - m.bboxLeft;
}

// Aplica el origin correcto (anclado al bbox real) a una sprite de
// Phaser para la pose/textura dada.
export function anchorSprite(sprite, key) {
  const m = SPRITE_MANIFEST[key];
  sprite.setOrigin(m.centerXFrac, m.footYFrac);
  return sprite;
}
