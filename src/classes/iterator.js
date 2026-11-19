class Iterator {
  constructor(tabela, slice) {
    this._tabela = tabela;
    this._slice = slice;
  }

  /** Passos já dados (0 = estado inicial). */
  get progress() { throw new Error("Not Yet implemented"); }
  reset() { throw new Error("Not Yet implemented"); }
  next() { throw new Error("Not Yet implemented"); }

  first() { this.reset(); return true; }

  /** Vai para o passo `n` refazendo desde o início (iteradores locais são baratos). */
  goTo(n) {
    this.reset();
    while (this.progress < n && this.next());
    return this.progress === n;
  }

  prev() { return this.progress > 0 && this.goTo(this.progress - 1); }
  last() { while (this.next()); return true; }
}

class BestRowIterator extends Iterator {
  /**
   * @param {boolean} iterateAllRow
   *   true  -> cada next() avança 1 célula
   *   false -> cada next() avança 1 linha inteira
   */
  constructor(tabela, slice, iterateAllRow = true) {
    super(tabela, slice);
    this.iterateAllRow = iterateAllRow;
    this.reset();
  }

  reset() {
    this.n = 0;
    this.step = -1;
    this.currentRow = -1;
    this.bestRow = -1;
    this.bestRowZeros = -1;
    this.qntZeros = 0;
    this.fim = false;
  }

  get progress() { return this.n; }

  _valor(row, col) {
    return this._slice.valueAt(this._tabela, row, col);
  }

  _countRow(row) {
    let qnt = 0;
    for (let c = 0; c < this._slice.side; c++) {
      if (this._valor(row, c) === 0) qnt++;
    }
    return qnt;
  }

  _updateBest() {
    if (this.qntZeros > this.bestRowZeros) {
      this.bestRowZeros = this.qntZeros;
      this.bestRow = this.currentRow;
    }

    if (this.bestRowZeros >= this._slice.side) this.fim = true;
  }

  next() {
    if (this.fim) return false;
    const { side } = this._slice;

    if (this.iterateAllRow) {
      if (this.step + 1 >= side * side) { this.fim = true; return false; }

      this.step++;
      this.currentRow = Math.floor(this.step / side);
      const col = this.step % side;

      if (col === 0) this.qntZeros = 0;
      if (this._valor(this.currentRow, col) === 0) this.qntZeros++;
      if (col === side - 1) this._updateBest();
    } else {
      if (this.currentRow + 1 >= side) { this.fim = true; return false; }

      this.currentRow++;
      this.step = this.currentRow * side;
      this.qntZeros = this._countRow(this.currentRow);
      this._updateBest();
    }

    this.n++;
    return true;
  }
}

class LaplaceIterrator extends Iterator {
  /** @param {number} bestRow Linha relativa ao slice */
  constructor(tabela, slice, bestRow) {
    super(tabela, slice);
    this.bestRow = bestRow;
    this.reset();
  }

  reset() { this.step = 0; }
  get progress() { return this.step; }

  /** Determinante direto da slice (qualquer lado). */
  static direto(tabela, slice) {
    return DetDireto.calcular(tabela, slice.rows, slice.cols);
  }

  valor(col) { return this._slice.valueAt(this._tabela, this.bestRow, col); }
  sinal(col) { return (this.bestRow + col) % 2 === 0 ? 1 : -1; }
  pivo(col) { return this._slice.pos(this.bestRow, col); }

  /** Minor obtido eliminando a linha de expansão e a coluna `col`. */
  filho(col) {
    const s = this._slice;
    return new TabelaSlice(s.x, s.y, s.side - 1, s.layer + 1, null, [
      ...s.positionsToIgnore,
      this.pivo(col),
    ]);
  }

  /** Termo da coluna `col`; sem filho quando o elemento é 0. */
  termo(col) {
    const valor = this.valor(col);
    return { col, valor, sinal: this.sinal(col), filho: valor === 0 ? null : this.filho(col) };
  }

  next() {
    if (this.step >= this._slice.side) return null;
    return this.termo(this.step++);
  }

  prev() {
    if (this.step <= 0) return null;
    return this.termo(--this.step);
  }

  goTo(n) {
    if (n < 0 || n > this._slice.side) return false;
    this.step = n;
    return true;
  }
  last() { this.step = this._slice.side; return true; }
}

class DetDireto {
  static calcular(tabela, rows, cols) {
    const k = rows.length;
    const t = tabela.tabela;
    const n = tabela.side;

    if (k === 0) return 1;
    if (k === 1) return t[rows[0] * n + cols[0]];
    if (k === 2) {
      return t[rows[0] * n + cols[0]] * t[rows[1] * n + cols[1]]
        - t[rows[0] * n + cols[1]] * t[rows[1] * n + cols[0]];
    }

    const a = new Float64Array(k * k);
    for (let row = 0; row < k; row++) {
      for (let col = 0; col < k; col++) a[row * k + col] = t[rows[row] * n + cols[col]];
    }

    let melhor = 0;
    let melhorZeros = -1;
    for (let row = 0; row < k; row++) {
      let zeros = 0;
      for (let col = 0; col < k; col++) if (a[row * k + col] === 0) zeros++;
      if (zeros === k) return 0;
      if (zeros > melhorZeros) { melhorZeros = zeros; melhor = row; }
    }

    if (melhor === k - 1) return DetDireto._cofatores(a, k);
    for (let c = 0; c < k; c++) {
      const tmp = a[melhor * k + c];
      a[melhor * k + c] = a[(k - 1) * k + c];
      a[(k - 1) * k + c] = tmp;
    }
    const det = DetDireto._cofatores(a, k);
    return det === 0 ? 0 : -det;
  }

  static _cofatores(a, k) {
    const total = 1 << k;
    const g = new Float64Array(total);
    const pc = new Uint8Array(total);
    g[0] = 1;

    for (let mask = 1; mask < total; mask++) {
      pc[mask] = pc[mask >> 1] + (mask & 1);
      const row = pc[mask] - 1;
      let soma = 0;
      let idx = 0;

      for (let j = 0; j < k; j++) {
        if (!(mask & (1 << j))) continue;
        const v = a[row * k + j];
        if (v !== 0) soma += ((row + idx) & 1 ? -1 : 1) * v * g[mask ^ (1 << j)];
        idx++;
      }
      g[mask] = soma;
    }
    return g[total - 1];
  }
}