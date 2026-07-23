# Fondos

Hoy solo existe un fondo aprobado: `fabrica.png` (pixel art de alto
detalle, sin marca Primadera). Por decisión de negocio, se reutiliza
para los 3 escenarios (bodega, fábrica, retail) hasta que diseño entregue
`bodega.png` y `retail.png` en el mismo tratamiento visual.

## Cómo activar los fondos definitivos

1. Genera `bodega.png` y `retail.png` en el mismo estilo/escala que
   `fabrica.png` (ilustración fija, sin marca, mismo nivel de detalle).
2. Cópialos a esta carpeta.
3. Actualiza el mapa `BACKGROUNDS` en `src/data.js`:

```js
export const BACKGROUNDS = {
  warehouse: 'bodega',
  factory: 'fabrica',
  retail: 'retail',
};
```

4. Agrega la carga en `src/scenes/BootScene.js` si el nombre de archivo
   no coincide con el theme (ya se cargan todos los valores únicos de
   `BACKGROUNDS` automáticamente, así que normalmente no hay que tocar
   nada más).

No se necesita ningún otro cambio de código — el resto del juego lee el
fondo desde este mapa.
