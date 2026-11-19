function getFontSize(x) {
  return Math.max(Math.round((2560 - 15 * x) / 80), 12);
}

class Canvas {
  static COR_INSERCAO = "#e0e0e0";

  constructor(
    /** @type {CanvasRenderingContext2D} */
    ctx,
    /** @type {Number} */
    w,
    /** @type {Number} */
    h,
  ) {
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
    this.w = w;
    this.h = h;
  }

  clear() {
    const { ctx, w, h } = this;
    const _color = ctx.fillStyle;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = _color;
  }

  _drawRow(initX, initY, newX, newY) {
    this.ctx.moveTo(initX, initY);
    this.ctx.lineTo(newX, newY);
  }

  _drawEvento(ev, tabela, cw, ch) {
    const ctx = this.ctx;
    const slice = ev.frame.slice;

    const minor = (s) => ({
      rows: Array.from({ length: s.side }, (_, i) => s.absRow(i)),
      cols: Array.from({ length: s.side }, (_, i) => s.absCol(i)),
    });
    const rgba = (c, a) => `rgba(${c.r},${c.g},${c.b},${a})`;
    const cell = (y, x, style) => {
      ctx.fillStyle = style;
      ctx.fillRect(x * cw, y * ch, cw, ch);
    };

    const PIVO = "rgba(255,140,0,0.6)";
    const ATUAL = "rgba(31,111,235,0.45)";
    const MELHOR = "rgba(46,160,67,0.3)";

    const { rows, cols } = minor(slice);
    const linha = (y, style) => { for (const x of cols) cell(y, x, style); };

    ctx.save();

    const ALFA_ATIVA = 0.35;
    const ALFA_ANCESTRAL = 0.22;
    const ALFA_MIN = 0.1;

    ctx.save();

    const camadas = [];
    for (let f = ev.frame.parent; f; f = f.parent) camadas.unshift(f.slice);
    camadas.push(slice);

    camadas.forEach((s, i) => {
      const distancia = camadas.length - 1 - i;
      const alfa = distancia === 0
        ? ALFA_ATIVA
        : Math.max(ALFA_MIN, ALFA_ANCESTRAL / distancia);

      const m = minor(s);
      for (const y of m.rows) {
        for (const x of m.cols) {
          cell(y, x, "#fff");
          cell(y, x, rgba(s.color, alfa));
        }
      }
    });

    switch (ev.type) {
      case "scan":
        if (ev.bestRow >= 0) linha(rows[ev.bestRow], MELHOR);
        linha(rows[ev.row], "rgba(31,111,235,0.18)");
        if (ev.col >= 0) cell(rows[ev.row], cols[ev.col], ATUAL);
        break;
      case "pick":
        linha(rows[ev.frame.bestRow], MELHOR);
        break;
      case "expand": {
        const filho = ev.termo.filho;
        const m = minor(filho);
        linha(rows[ev.frame.bestRow], MELHOR);
        for (const y of m.rows) for (const x of m.cols) cell(y, x, rgba(filho.color, 0.3));
        cell(rows[ev.frame.bestRow], cols[ev.termo.col], PIVO);
        break;
      }
      case "combine":
        cell(rows[ev.frame.bestRow], cols[ev.frame.col], PIVO);
        break;
      case "leaf":
      case "resolve":
        for (const y of rows) for (const x of cols) cell(y, x, rgba(slice.color, 0.3));
        break;
      case "skip":
        linha(rows[ev.frame.bestRow], MELHOR);
        cell(rows[ev.frame.bestRow], cols[ev.termo.col], ZERO);
        break;
      case "zeroRow":
        linha(rows[ev.frame.bestRow], ZERO);
        break;
    }

    ctx.restore();
  }

  drawSlice(ctx) {
    ctx.fillRect(
      0, 0, 50, 50
    )
  }

  drawMesh(
    /** @type {Tabela} */
    tabela,
    evento = null
  ) {
    const ctx = this.ctx;
    this.clear();

    const { w, h } = this;
    if (!tabela._qntCells) {
      ctx.save();
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("{ }", Math.floor(w / 2) - 24, Math.floor(h / 2));
      ctx.restore();
      return;
    }

    const cellSizeW = w / tabela.side,
      cellSizeH = h / tabela.side;

    ctx.save();
    ctx.font = `${getFontSize(tabela._qntCells)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.beginPath();
    if (tabela.preencher._podePreencher) {
      const pos = tabela.preencher._posix;
      const oldStyle = ctx.fillStyle;
      ctx.fillStyle = Canvas.COR_INSERCAO;
      ctx.fillRect(
        (pos % tabela.side) * cellSizeW,
        Math.floor(pos / tabela.side) * cellSizeH,
        cellSizeW,
        cellSizeH,
      );
      ctx.fillStyle = oldStyle;
    } else if (evento) {
      this._drawEvento(evento, tabela, cellSizeW, cellSizeH);
    }

    for (let i = 0; i < tabela.side; i++) {
      const _x = (i + 1) * cellSizeW;
      const _y = (i + 1) * cellSizeH;
      this._drawRow(_x, 0, _x, h);
      this._drawRow(0, _y, w, _y);
      for (let j = 0; j < tabela.side; j++) {
        ctx.fillText(
          tabela.tabela[i * tabela.side + j] ?? "",
          Math.floor((j + 1) * cellSizeW - cellSizeW / 2),
          Math.floor(_y - cellSizeH / 2),
        );
      }
    }

    ctx.stroke();
    ctx.restore();
  }
}
