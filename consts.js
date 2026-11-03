/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("desenho");

const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 750;

const ctx = canvas.getContext("2d");

const CORES = gerarCores(50);
const cellIndicator = document.getElementById("qnt-cells");
const inputItem = document.getElementById("input-number-controle-itens");
const erroItem = document.getElementById("itens-erro");
const layersList = document.getElementById("dados");

const LAYER_IDENTATION = 7.5;
