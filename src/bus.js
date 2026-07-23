// Bus de eventos minimalista para desacoplar las escenas de Phaser
// (juego/plataformas) de la capa de UI en DOM (pantallas superpuestas).
class Bus extends EventTarget {
  emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }
  on(name, fn) {
    const handler = (e) => fn(e.detail);
    this.addEventListener(name, handler);
    return () => this.removeEventListener(name, handler);
  }
}

export const bus = new Bus();
