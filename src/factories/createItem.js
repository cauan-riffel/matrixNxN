function createLayer(/** @type {TabelaSlice} */ slice,
  view = { estado: slice.state, valores: [] },
) {
  const { r, g, b } = slice.color;

  const container = document.createElement("div");
  container.className = "layer-item";
  container.style.marginLeft = `${slice.layer * LAYER_IDENTATION}px`;


  const header = document.createElement("div");
  header.className = "layer-item-headder";

  const titleBox = document.createElement("div");

  const title = document.createElement("p");
  title.textContent = `Camada ${slice.layer + 1}`;

  const status = document.createElement("p");
  status.className = "layer-item-status";
  status.textContent = view.estado.nome;

  titleBox.append(title, status);

  const color = document.createElement("div");
  color.className = "layer-item-color";
  color.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${Color.DEFAULT_ALPHA})`;

  header.append(titleBox, color);


  const info = createList([
    ["X", slice.absCol(0) + 1],
    ["Y", slice.absRow(0) + 1],
    ["Tamanho", slice.side],
  ]);
  info.classList.add("layer-item-info");


  const divider = document.createElement("hr");
  divider.className = "layer-item-divider";


  const stateValues = createList(view.valores);
  stateValues.classList.add("layer-item-state");

  container.append(header, info, divider, stateValues);
  return container;
}

function createList(/** @type {[string, string | number | Array<string | number>][]} */ entries) {
  const list = document.createElement("ul");
  for (const [label, value] of entries) {
    const li = document.createElement("li");

    if (Array.isArray(value)) {
      li.append(`${label}: `);
      const box = document.createElement("span");
      box.className = "layer-item-dets";
      if (value.length === 0) box.textContent = "—";
      for (const v of value) {
        const chip = document.createElement("span");
        chip.className = "layer-item-det";
        chip.textContent = v ?? "—";
        box.append(chip);
      }
      li.append(box);
    } else {
      li.textContent = `${label}: ${value}`;
    }

    list.appendChild(li);
  }
  return list;
}

function melhorLinha(slice, bestRow, zeros) {
  if (bestRow < 0) return "—";
  return `${slice.absRow(bestRow) + 1} (${zeros} ${zeros === 1 ? "zero" : "zeros"})`;
}

function topView(ev) {
  const f = ev.frame;
  const s = f.slice;
  const melhor = melhorLinha(s, f.bestRow, f.bestRowZeros);

  switch (ev.type) {
    case "scan":
      return {
        slice: s,
        estado: SliceState.LOOKIN_BEST_ROW,
        valores: [
          ["Linha atual", s.absRow(ev.row) + 1],
          ["Zeros na linha atual", ev.qntZeros],
          ["Melhor linha", melhorLinha(s, ev.bestRow, ev.bestRowZeros)],
        ],
      };
    case "pick":
      return {
        slice: s,
        estado: SliceState.EXPANDINDO,
        valores: [["Melhor linha", melhor]],
      };
    case "expand":
      return {
        slice: s,
        estado: SliceState.EXPANDINDO,
        valores: [
          ["Melhor linha", melhor],
          ["Coluna atual", ev.termo.col + 1],
          ["Sinal", ev.termo.sinal > 0 ? "+" : "−"],
          ["Elemento", ev.termo.valor],
          ["Determinantes", f.dets],
        ],
      };
    case "combine":
      return {
        slice: s,
        estado: SliceState.EXPANDINDO,
        valores: [
          ["Melhor linha", melhor],
          ["Coluna atual", f.col + 1],
          ["Det. do minor", ev.det],
          ["Determinantes", f.dets],
        ],
      };
    case "resolve":
      return {
        slice: s,
        estado: SliceState.RESOLVIDA,
        valores: [
          ["Melhor linha", melhor],
          ["Determinantes", f.dets],
          ["Determinante", ev.det],
        ],
      };
    case "skip":
      return {
        slice: s,
        estado: SliceState.EXPANDINDO,
        valores: [
          ["Melhor linha", melhor],
          ["Coluna atual", f.col + 1],
          ["Elemento", 0],
          ["Determinantes", f.dets],
        ],
      };
    case "zeroRow":
      return {
        slice: s,
        estado: SliceState.RESOLVIDA,
        valores: [
          ["Melhor linha", melhor],
          ["Determinante", ev.det],
        ],
      };
    default:
      return {
        slice: s,
        estado: SliceState.RESOLVIDA,
        valores: [["Determinante", ev.det]],
      };
  }
}

function layerViews(ev, root) {
  if (!ev) return [{ slice: root, estado: SliceState.AGUARDANDO, valores: [] }];

  const nos = [];
  for (let f = ev.frame; f; f = f.parent) nos.unshift(f);

  const views = nos.slice(0, -1).map((n) => ({
    slice: n.slice,
    estado: SliceState.EXPANDINDO,
    valores: [
      ["Melhor linha", melhorLinha(n.slice, n.bestRow, n.bestRowZeros)],
      ["Coluna atual", n.col + 1],
      ["Determinantes", n.dets],
    ],
  }));

  views.push(topView(ev));

  if (ev.type === "expand") {
    views.push({ slice: ev.termo.filho, estado: SliceState.AGUARDANDO, valores: [] });
  }
  return views;
}

function renderLayers(timeline) {
  const dados = document.getElementById("dados");
  const ativa = timeline.current?.frame.slice;
  const views = layerViews(timeline.current, timeline.root);


  tabela.slices.length = 0;
  tabela.appendSlice(...views.map((v) => v.slice));

  dados.replaceChildren(
    ...views.map((v) => {
      const el = createLayer(v.slice, v);
      if (v.slice === ativa) el.classList.add("layer-item-ativa");
      return el;
    }),
  );
  dados.scrollTop = dados.scrollHeight;
}