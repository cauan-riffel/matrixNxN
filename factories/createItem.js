function createLayer(/** @type {TabelaSlice} */ slice) {
  const { r, g, b } = slice.color;

  const container = document.createElement("div");
  container.className = "layer-item";
  container.style.marginLeft = `${slice.layer * LAYER_IDENTATION}px`;

  const header = document.createElement("div");
  header.className = "layer-item-headder";

  const title = document.createElement("p");
  title.textContent = `Camada ${slice.layer + 1}`;

  const color = document.createElement("div");
  color.className = "layer-item-color";
  color.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${Color.DEFAULT_ALPHA})`;

  header.append(title, color);

  const list = document.createElement("ul");
  for (const [label, value] of [["X", slice.x + 1], ["Y", slice.y + 1]]) {
    const li = document.createElement("li");
    li.textContent = `${label}: ${value}`;
    list.appendChild(li);
  }

  container.append(header, list);
  return container;
}