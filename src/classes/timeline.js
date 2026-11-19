class LimiteExcedido extends Error {
  constructor(limite, dica = false) {
    super(
      `Matriz grande demais para o stepper: mais de ${limite.toLocaleString("pt-BR")} submatrizes distintas.` +
        (dica ? ' Aumente "Calcular direto até" nas configurações.' : ""),
    );
    this.name = "LimiteExcedido";
  }
}

class Timeline {
    /**
   * @param {boolean} iterateAllRow false = cada passo da varredura é uma linha inteira
   * @param {number} diretoAte minors com lado <= diretoAte viram 1 passo (cálculo direto)
   * @param {number} limite máximo de submatrizes (não diretas) memorizadas
   */
  constructor(tabela, { iterateAllRow = true, diretoAte = 2, root = tabela.slices[0], limite = 1_000_000 } = {}) {
    this.tabela = tabela;
    this.iterateAllRow = iterateAllRow;
    this.diretoAte = Math.max(2, diretoAte);
    this.root = root;
    this.limite = limite;
    this.internos = 0;

    this.memo = new Map();

    this.total = this._entry(root).count;

    this.cursor = 0n;
    this._current = null;
  }

  get progress() { return this.cursor; }
  get current() { return this._current; }
  get hasNext() { return this.cursor < this.total; }
  get determinante() { return this._entry(this.root).det; }

  goTo(n) {
    n = BigInt(n);
    if (n < 0n || n > this.total) return false;
    this.cursor = n;
    this._current = n === 0n ? null : this._descer(this.root, null, n);
    return true;
  }

  first() { return this.goTo(0n); }
  next() { return this.goTo(this.cursor + 1n); }
  prev() { return this.goTo(this.cursor - 1n); }
  last() { return this.goTo(this.total); }

  _ev(type, frame, extra = {}) { return { type, frame, ...extra }; }

  _entry(slice) {
    const key = slice.key;
    let e = this.memo.get(key);
    if (e) return e;

    if (slice.side <= this.diretoAte) {
      e = { leaf: true, count: 1n, det: LaplaceIterrator.direto(this.tabela, slice) };
    } else {
      if (this.internos >= this.limite) {
        throw new LimiteExcedido(this.limite, this.diretoAte < this.root.side - 1);
      }
      this.internos++;

      const scan = slice.iterator;
      scan.iterateAllRow = this.iterateAllRow;
      scan.reset();
      scan.last();

      e = {
        leaf: false,
        passos: scan.progress,
        bestRow: scan.bestRow,
        bestRowZeros: scan.bestRowZeros,
        zeroRow: scan.bestRowZeros >= slice.side,
        count: 0n,
        det: 0,
      };

      const S = BigInt(e.passos);
      if (e.zeroRow) {
        e.count = S + 2n;
      } else {
        const lap = new LaplaceIterrator(this.tabela, slice, e.bestRow);
        let count = S + 2n;
        let soma = 0;

        for (let c = 0; c < slice.side; c++) {
          const valor = lap.valor(c);
          if (valor === 0) { count += 1n; continue; }

          const ce = this._entryFilho(slice, lap, c);
          count += 2n + ce.count;
          soma += lap.sinal(c) * valor * ce.det;
        }
        e.count = count;
        e.det = soma;
      }
    }

    this.memo.set(key, e);
    return e;
  }


  _entryFilho(slice, lap, c) {
    const [y, x] = lap.pivo(c);
    const key = TabelaSlice.chave(slice.maskRows | (1 << y), slice.maskCols | (1 << x));
    return this.memo.get(key) ?? this._entry(lap.filho(c));
  }

  _descer(slice, parent, k) {
    const e = this._entry(slice);
    let frame = { slice, parent, bestRow: -1, bestRowZeros: -1, col: -1, soma: 0, dets: [] };

    if (e.leaf) return this._ev("leaf", frame, { det: e.det });

    const S = BigInt(e.passos);

    if (k <= S) {
      const scan = slice.iterator;
      scan.iterateAllRow = this.iterateAllRow;
      scan.goTo(Number(k));
      return this._ev("scan", frame, {
        row: scan.currentRow,
        col: scan.iterateAllRow ? scan.step % slice.side : -1,
        qntZeros: scan.qntZeros,
        bestRow: scan.bestRow,
        bestRowZeros: scan.bestRowZeros,
      });
    }

    frame = { ...frame, bestRow: e.bestRow, bestRowZeros: e.bestRowZeros };
    if (k === S + 1n) return this._ev("pick", frame, { zeros: e.bestRowZeros });
    if (e.zeroRow) return this._ev("zeroRow", frame, { det: 0 });

    const lap = new LaplaceIterrator(this.tabela, slice, e.bestRow);
    let resto = k - S - 1n;
    let soma = 0;
    const dets = [];

    for (let c = 0; c < slice.side; c++) {
      const valor = lap.valor(c);
      const sinal = lap.sinal(c);

      if (valor === 0) {
        if (resto === 1n) {
          return this._ev("skip", { ...frame, col: c, soma, dets: [...dets, null] }, { termo: lap.termo(c) });
        }
        resto -= 1n;
        dets.push(null);
        continue;
      }

      const ce = this._entryFilho(slice, lap, c);
      const tam = 2n + ce.count;

      if (resto <= tam) {
        const termo = lap.termo(c);
        const f = { ...frame, col: c, soma, dets: [...dets] };

        if (resto === 1n) return this._ev("expand", f, { termo });
        if (resto === tam) {
          return this._ev(
            "combine",
            { ...f, soma: soma + sinal * valor * ce.det, dets: [...dets, ce.det] },
            { termo, det: ce.det },
          );
        }
        return this._descer(termo.filho, f, resto - 1n);
      }

      resto -= tam;
      soma += sinal * valor * ce.det;
      dets.push(ce.det);
    }

    return this._ev("resolve", { ...frame, col: slice.side - 1, soma, dets }, { det: soma });
  }

  static describe(ev) {
    if (!ev) return "Estado inicial";
    const f = ev.frame;
    const camada = `Camada ${f.slice.layer + 1}`;
    switch (ev.type) {
      case "scan":
        return `${camada}: linha ${ev.row + 1}${ev.col >= 0 ? `, coluna ${ev.col + 1}` : ""} (zeros: ${ev.qntZeros})`;
      case "pick":
        return `${camada}: linha ${f.bestRow + 1} escolhida para a expansão`;
      case "expand":
        return `${camada}: coluna ${ev.termo.col + 1}, sinal ${ev.termo.sinal > 0 ? "+" : "−"}, elemento ${ev.termo.valor}`;
      case "skip":
        return `${camada}: elemento 0 na coluna ${ev.termo.col + 1}, termo ignorado`;
      case "zeroRow":
        return `${camada}: a linha ${f.slice.absRow(f.bestRow) + 1} só tem zeros, determinante = 0`;
      case "leaf":
        return `${camada}: determinante direto = ${ev.det}`;
      case "combine":
        return `${camada}: determinante do minor = ${ev.det}`;
      case "resolve":
        return `${camada}: determinante = ${ev.det}`;
    }
  }
}