function gerarCores(quantidade = 50) {
  const cores = [];

  for (let i = 0; i < quantidade; i++) {
    const progresso = i / (quantidade - 1);

    // Primeiras cores: saturadas e chamativas.
    // Últimas cores: pouco saturadas e discretas.
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
