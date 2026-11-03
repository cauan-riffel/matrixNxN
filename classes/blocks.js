class Rect {
  constructor(w, h) {
    /** @type {Number} */
    this.w = Number(w);
    /** @type {Number} */
    this.h = Number(h);
  }
}

class SliceState {
  static LOOKIN_BEST_ROW = new SliceState("PROCURANDO_MELHOR_COLUNA");

  constructor(nome) {
    this.nome = nome;
    Object.freeze(this);
  }

  toString() {
    return `SliceState.${this.nome}`;
  }
}

class Color {
  static DEFAULT_ALPHA = 0.1;
  constructor(r, g, b) {
    /** @type {Number} */
    this.r = r;
    /** @type {Number} */
    this.g = g;
    /** @type {Number} */
    this.b = b;
  }

  static fromRandom() {
    return new Color(
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
    );
  }

  static fromLayer(layer) {
    return CORES[layer % 50];
  }
}

class TabelaSlice {
  constructor(x, y, side, layer = 0, color = null) {
    /** @type {Number} */
    this.layer = layer;
    /** @type {Number} */
    this.x = x;
    /** @type {Number} */
    this.y = y;
    /** @type {Number} */
    this.side = side;

    /** @type {Color} */
    this.color = color instanceof Color ? color : Color.fromLayer(layer);

    /** @type {SliceState} */
    this.state = SliceState.LOOKIN_BEST_ROW;

    this.determinantes = [];
  }

  static from_rect(
    /** @type {Rect} */
    rect,
    /** @type {Number} */
    w,
  ) {
    return new TabelaSlice(rect.w, rect.h, w);
  }
}

class RowCounter {
  constructor(tabela, slice) {
    /** @type {Tabela} */
    this._tabela = tabela;
    /** @type {TabelaSlice} */
    this.slice = slice;

    this.betterRow = 0;
    this._counter = 0;
  }

  next() {
    for (let i = 0; i < this.slice.side; i++) {
      const xPos = this.slice.x % this._tabela._size.w;

      for (let j = 0; j < this.slice.h; j++) {
        const yPos = this.slice.y % this._tabela._size.h;
      }
    }

    this._tabela.tabela;
  }
}
