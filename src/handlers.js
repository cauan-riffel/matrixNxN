
function handleRangeChange(event) {
    const target = event.target;
    tabela.setSize(target.valueAsNumber);
    cellIndicator.textContent = target.value;
    stepper.reset()
    if (tabela.preencher.tabelaCopleta()) {
        BTN_CALCULAR.style.display = 'block'
    } else {
        BTN_CALCULAR.style.display = 'none'
    }
    updateTable();
}

function handleAddItem() {
    const val = tabela.preencher.addValue(inputItem.valueAsNumber);
    if (val) {
        return (erroItem.textContent = val.message);
    } else {
        erroItem.textContent = '';
        inputItem.value = '';
    }
    if (tabela.preencher.tabelaCopleta()) {
        BTN_CALCULAR.style.display = 'block'
    }
    updateTable();
}


function handleReiniciar() {
    stepper.reset();
    tabela.slices.length = 0;

    document.getElementById("input-range-qnt-colunas").value = Tabela.DEFAULT_SIZE;
    cellIndicator.textContent = Tabela.DEFAULT_SIZE;
    tabela.setSize(Tabela.DEFAULT_SIZE);

    document.getElementById("dados").replaceChildren();
    BTN_CALCULAR.style.display = "none";
    erroItem.textContent = "";
    inputItem.value = "";

    showDiv(document.getElementById("controles"));
    stepper.render();
    inputItem.focus();

    updateTable();
}

function handleRandomTable() {
    const lado = tabela.side;
    if (!lado) return;
    stepper.reset();
    tabela.slices.length = 0;
    document.getElementById("dados").replaceChildren();
    showDiv(document.getElementById("controles"));

    tabela.setSize(lado);

    for (let i = 0; i < tabela._qntCells; i++) {
        tabela.preencher.addValue(valorAleatorio());
    }

    erroItem.textContent = "";
    inputItem.value = "";
    BTN_CALCULAR.style.display = "block";
    stepper.render();
}

function lerConfiguracoes() {
    const n = document.getElementById("input-direto-ate").valueAsNumber;
    return {
        iterateAllRow: !document.getElementById("chk-linha-inteira").checked,
        diretoAte: Number.isInteger(n) ? Math.max(2, n) : 2,
    };
}

function handleCalcular() {
    tabela.appendSliceBase();

    let timeline;
    try {
        timeline = new Timeline(tabela, lerConfiguracoes());
    } catch (e) {
        if (!(e instanceof LimiteExcedido)) throw e;
        tabela.slices.length = 0;
        erroItem.textContent = e.message;
        return;
    }

    hideDiv(document.getElementById("controles"));
    stepper.bind(timeline);
}