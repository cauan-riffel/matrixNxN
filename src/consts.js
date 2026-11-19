const LAYER_IDENTATION = 7.5;
const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 750;

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("desenho");

const ctx = canvas.getContext("2d");

const CORES = gerarCores(50);
const cellIndicator = document.getElementById("qnt-cells");
const inputItem = document.getElementById("input-number-controle-itens");
const erroItem = document.getElementById("itens-erro");
const LAYERS_LIST = document.getElementById("dados");
const BTN_CALCULAR = document.getElementById("btn-calcular");
const BTN_ADD_ITEM = document.getElementById("btn-add-item");
const ZERO = "rgba(198,40,40,0.35)";
const STEP_INDICATOR = document.getElementById("step-indicador");
const STEP_DESCRICAO = document.getElementById("step-descricao");
const BTN_PREV = document.getElementById("btn-step-prev");
const BTN_NEXT = document.getElementById("btn-step-next");
const BTN_LAST = document.getElementById("btn-step-last");
const CHK_TOTAL = document.getElementById("chk-mostrar-total");