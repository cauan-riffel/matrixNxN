class Iterator {
  next() {
    throw new Error("Not Yet implemented");
  }
  prev() {
    throw new Error("Not Yet implemented");
  }
}

class BestRowIterator extends Iterator {
  constructor(tabela, slice, iterateAllRow = true) {
    super();
    /** @type {Tabela} */
    this._tabela = tabela;
    /** @type {TabelaSlice} */
    this._slice = slice;
    /** @type {Boolean} */
    this.iterateAllRow = iterateAllRow;

    /** @type {Number} */
    this.bestRow = 0;
    /** @type {Number} */
    this.qntZeros = 0;
    /** @type {Number} */
    this.step = 0;
  }

  getPosicaoTabela(jmp = 0) {
    const slice = this._slice;
    const tableSide = this._tabela.side;
    let step = this.step;
    if (jmp + step > slice.side * slice.side) return -1;
    step += jmp;

    const basicPosix = slice.y * tableSide + slice.x;

    return (
      basicPosix +
      tableSide * Math.floor(step / slice.side) +
      (step % slice.side)
    );
  }

  _getRowZeros() {
    const { _slice: slice, _tabela: tabela } = this;

    const posix = this.getPosicaoTabela();
    let qnt = 0;
    for (let i = 0; i < slice.side; i++) {
      if (tabela.tabela[posix + i] === 0) qnt++;
    }
    return qnt;
  }

  next() {

  }
  prev() {}
}
