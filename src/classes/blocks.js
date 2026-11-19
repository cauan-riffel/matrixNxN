class SliceState {
  static AGUARDANDO = new SliceState("Aguardando");
  static LOOKIN_BEST_ROW = new SliceState("Procurando Melhor Linha");
  static EXPANDINDO = new SliceState("Expandindo por cofatores");
  static RESOLVIDA = new SliceState("Determinante Calculado");

  constructor(nome) {
    this.nome = nome;
    Object.freeze(this);
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
  /**
   * @param {Number} x
   * @param {Number} y
   * @param {Number} side
   * @param {Number} layer
   * @param {Color?} color
   * @param {Array<Array<int>>} positionsToIgnore
   */
  constructor(x, y, side, layer = 0, color = null, positionsToIgnore = []) {
    this.layer = layer;
    this.x = x;
    this.y = y;
    this.side = side;
    this.color = color instanceof Color
      ? color
      : Color.fromLayer(layer) ?? new Color(80, 80, 80);
    this.htmlCriado = false;
    this.state = SliceState.LOOKIN_BEST_ROW;

    this.positionsToIgnore = positionsToIgnore;
    this.ignoredRows = new Set(positionsToIgnore.map(([py]) => py));
    this.ignoredCols = new Set(positionsToIgnore.map(([, px]) => px));

    this.maskRows = 0;
    this.maskCols = 0;
    for (const [py, px] of positionsToIgnore) {
      this.maskRows |= 1 << py;
      this.maskCols |= 1 << px;
    }

    this.rows = TabelaSlice._indices(y, side, this.ignoredRows);
    this.cols = TabelaSlice._indices(x, side, this.ignoredCols);

    this.determinantes = [];
    this.iterator = new BestRowIterator(tabela, this);
  }

  static _indices(start, n, ignored) {
    const out = [];
    for (let i = start; out.length < n; i++) {
      if (!ignored.has(i)) out.push(i);
    }
    return out;
  }

  static chave(maskRows, maskCols) {
    return maskRows * 67108864 + maskCols;
  }

  get key() { return TabelaSlice.chave(this.maskRows, this.maskCols); }

  absRow(row) { return this.rows[row] ?? -1; }
  absCol(col) { return this.cols[col] ?? -1; }

  /** [y, x] absolutos de (row, col) relativos à slice. */
  pos(row, col) { return [this.absRow(row), this.absCol(col)]; }

  valueAt(tabela, row, col) {
    return tabela.tabela[this.rows[row] * tabela.side + this.cols[col]];
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
