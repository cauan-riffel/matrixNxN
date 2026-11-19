
function updateTable() {
  criarSlices();

  if (stepper.timeline) {
    stepper.render();
  } else {
    canvasDrawer.drawMesh(tabela);
  }
}

const stepper = {
  timeline: null,
  _auto: null,

  get intervalo() {
    const v = document.getElementById("input-step-intervalo").valueAsNumber;
    return Number.isFinite(v) ? Math.max(10, v) : 300;
  },

  bind(timeline) {
    this.stopAuto();
    this.timeline = timeline;
    document.getElementById("stepper").hidden = false;
    this.render();
  },

  reset() {
    this.stopAuto();
    this.timeline = null;
    document.getElementById("stepper").hidden = true;
  },

  startAuto(dir) {
    if (!this.timeline) return;
    if (this._auto?.dir === dir) return this.stopAuto();
    this.stopAuto();
    this._auto = { dir, timer: null };
    this._tick();
  },

  stopAuto() {
    if (this._auto) clearTimeout(this._auto.timer);
    this._auto = null;
    this._syncAuto();
  },

  _tick() {
    const tl = this.timeline;
    const auto = this._auto;
    if (!tl || !auto) return;

    const moveu = auto.dir > 0 ? tl.next() : tl.prev();
    this.render();

    const podeContinuar = auto.dir > 0 ? tl.hasNext : tl.progress > 0;
    if (!moveu || !podeContinuar) return this.stopAuto();

    auto.timer = setTimeout(() => this._tick(), this.intervalo);
  },

  _syncAuto() {
    const tl = this.timeline;
    if (!tl) return;
    const dir = this._auto?.dir ?? 0;
    const prev = document.getElementById("btn-auto-prev");
    const next = document.getElementById("btn-auto-next");

    prev.value = dir === -1 ? "⏸ Pausar" : "◂ Auto";
    next.value = dir === 1 ? "⏸ Pausar" : "Auto ▸";
    prev.disabled = dir !== -1 && tl.progress <= 0;
    next.disabled = dir !== 1 && !tl.hasNext;
  },

  render() {
    const tl = this.timeline;

    if (!tl) {
      canvasDrawer.drawMesh(tabela);
      return;
    }

    const fmt = (n) => n.toLocaleString("pt-BR");
    const mostrarTotal = CHK_TOTAL.checked;

    STEP_INDICATOR.textContent =
      `${fmt(tl.progress)} / ${mostrarTotal ? fmt(tl.total) : "?"}`;
    STEP_DESCRICAO.textContent = Timeline.describe(tl.current);
    BTN_PREV.disabled = tl.progress <= 0;
    BTN_NEXT.disabled = !tl.hasNext;
    BTN_LAST.disabled = !tl.hasNext;
    this._syncAuto();

    canvasDrawer.drawMesh(tabela, tl.current);
    renderLayers(tl);
  },
};

function executeIterator(goPrev = false, lastStep = false) {
  const tl = stepper.timeline;
  if (!tl) return;

  stepper.stopAuto();

  if (lastStep) tl.last();
  else if (goPrev) tl.prev();
  else tl.next();

  stepper.render();
}

let done = false;
document.getElementById("input-range-qnt-colunas").value = Tabela.DEFAULT_SIZE;
cellIndicator.innerHTML = Tabela.DEFAULT_SIZE;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

canvasDrawer = new Canvas(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
const tabela = new Tabela();

updateTable();
