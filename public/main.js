import { SCREEN_WIDTH, DISPLAY_BUFFER } from "./chip8.js";

const CHIP8_WIDTH = 64;
const CHIP8_HEIGHT = 32;

const CANVAS_WIDTH = CHIP8_WIDTH * 10;
const CANVAS_HEIGHT = CHIP8_HEIGHT * 10;

function setupCanvas() {
    mainCanvas.width = CANVAS_WIDTH;
    mainCanvas.height = CANVAS_HEIGHT;

    mainCanvas.style.width = mainCanvas.width + 'px';
    mainCanvas.style.height = mainCanvas.height + 'px';

    mainContext.imageSmoothingEnabled = false;

}


//globals ?
let mainCanvas = document.querySelector("canvas");
let mainContext = mainCanvas.getContext("2d");

setupCanvas();