function getFontSize(x) {
  return Math.max(Math.round((2560 - 15 * x) / 80), 12);
}

class Canvas {
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
    /** @type {Rect} */
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

  drawMesh(
    /** @type {Tabela} */
    tabela,
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
      ctx.fillStyle = "#e0e0e0";
      ctx.fillRect(
        (pos % tabela.side) * cellSizeW,
        Math.floor(pos / tabela.side) * cellSizeH,
        cellSizeW,
        cellSizeH,
      );
      ctx.fillStyle = oldStyle;
    } else if (tabela.slices.length) {
      for (let i = tabela.slices.length - 1; i >= 0; i--) {
        const slice = tabela.slices[i];
        console.log(slice);
      }
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
