function updateTable() {
  canvasDrawer.drawMesh(tabela);
}

document.getElementById("input-range-qnt-colunas").value = Tabela.DEFAULT_SIZE;
cellIndicator.innerHTML = Tabela.DEFAULT_SIZE;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

canvasDrawer = new Canvas(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
const tabela = new Tabela();
tabela.appendSlice(
  new TabelaSlice(5, 5, 5, 0),
  new TabelaSlice(5, 5, 5, 1),
  new TabelaSlice(5, 5, 5, 2),
  new TabelaSlice(5, 5, 5, 1),
);

layersList.appendChild(createLayer(tabela.slices[0]));
layersList.appendChild(createLayer(tabela.slices[1]));
layersList.appendChild(createLayer(tabela.slices[2]));
layersList.appendChild(createLayer(tabela.slices[3]));

const i = new BestRowIterator(tabela, tabela.slices[0]);
i.next();
i.next();
i.next();
i.next();
i.next();

updateTable();
