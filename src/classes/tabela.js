class Preenchimento {
  constructor(tabela) {
    /** @type {Tabela} */
    this._tabela = tabela;
    this._reset();
  }

  _reset() {
    /** @type {Number} */
    this._posix = 0;
    /** @type {Boolean} */
    this._podePreencher = this._tabela._qntCells !== 0;
  }

  tabelaCopleta() {
    return this._podePreencher === false;
  }

  addValue(value) {
    if (!Number.isFinite(+value)) {
      return new Error(`Valor ${value} informado não é um número!`);
    }
    if (!this._podePreencher) {
      return new Error(`Iterrador já preencheu toda a tabela!`);
    }
    this._tabela.tabela[this._posix++] = value;
    if (this._posix === this._tabela._qntCells) {
      this._podePreencher = false;
    }
  }
}

class Tabela {
  static DEFAULT_SIZE = 1;

  constructor() {
    /** @type {Preenchimento} */
    this.preencher = new Preenchimento(this);
    this.slices = [];
    this.setSize(Tabela.DEFAULT_SIZE);
  }

  appendSlice(...items) {
    for (const item of items) {
      if (item instanceof TabelaSlice) {
        this.slices.push(item);
      }
    }
  }
  appendSliceBase() {
    this.slices.push(
      new TabelaSlice(0, 0, this.side, 0, new Color(0, 0, 50))
    )
  }

  setSize(
    /** @type {Number} */
    size,
  ) {
    /** @type {Number} */
    this.side = size;

    /** @type {Number} */
    this._qntCells = size * size;

    /** @type {Float64Array} */
    this.tabela = new Float64Array(this._qntCells);

    this.preencher._reset();
  }
}
