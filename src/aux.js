function gerarCores(quantidade = 50) {
  const cores = [];

  for (let i = 0; i < quantidade; i++) {
    const progresso = i / (quantidade - 1);



    const hue = (i * 137.508) % 360;
    const saturation = 100 - progresso * 85;
    const lightness = 50 + progresso * 35;

    const [r, g, b] = hslParaRgb(hue, saturation, lightness);

    cores.push(new Color(r, g, b));
  }

  return cores;
}

function hslParaRgb(h, s, l) {
  s /= 100;
  l /= 100;

  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);

  const f = (n) => {
    const color =
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return Math.round(255 * color);
  };

  return [f(0), f(8), f(4)];
}

function showDiv(/** @type {HTMLElement} */ target) {
  clearTimeout(target._hideTimer);
  target.removeAttribute("style");
}

function hideDiv(
  /** @type {HTMLElement} */
  target,
  duracao = 300,
) {

  const gap = parseFloat(getComputedStyle(target.parentElement).rowGap) || 0;

  target.style.height = `${target.getBoundingClientRect().height}px`;
  target.style.overflow = "hidden";
  target.getBoundingClientRect();

  const props = ["height", "padding-top", "padding-bottom", "border-width", "margin-bottom", "opacity"];
  target.style.transition = props.map((p) => `${p} ${duracao}ms ease`).join(", ");

  target.style.height = "0px";
  target.style.paddingTop = "0px";
  target.style.paddingBottom = "0px";
  target.style.borderWidth = "0px";
  target.style.marginBottom = `${-gap}px`;
  target.style.opacity = "0";

  target._hideTimer = setTimeout(() => {
    target.style.display = "none";
  }, duracao + 20);
}

function criarSlices() {
  for (const slice of tabela.slices) {
    if (!slice.htmlCriado) {
      LAYERS_LIST.appendChild(createLayer(slice))
      slice.htmlCriado = true;
    }
  }
}

function valorAleatorio({ min = -9, max = 9, chanceDecimal = 0.2, chanceZero = 0.1 } = {}) {
  if (Math.random() < chanceZero) return 0;

  if (Math.random() < chanceDecimal) {
    const v = Math.random() * (max - min) + min;
    return Math.round(v * 100) / 100 || 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}