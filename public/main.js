//import { SCREEN_WIDTH, SCREEN_HEIGHT, DISPLAY_BUFFER } from "./chip8.js";
import * as chip8 from "./chip8.js";
//import { romArray  } from "./Soccer.js";
import { romArray  } from "./Brick.js";

const CANVAS_WIDTH = chip8.SCREEN_WIDTH * 10;
const CANVAS_HEIGHT = chip8.SCREEN_HEIGHT * 10;

function setupCanvas() {
    mainCanvas.width = CANVAS_WIDTH;
    mainCanvas.height = CANVAS_HEIGHT;

    mainCanvas.style.width = mainCanvas.width + 'px';
    mainCanvas.style.height = mainCanvas.height + 'px';

    mainContext.imageSmoothingEnabled = false;

}

function clearCanvas() {
    mainContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
}

function setupEvents() {
    document.querySelector("html").onkeyup = function(e) {
        if (e.key == "Enter") {
            enterKeyReleased = true;
        }
    };
}

function initEmulator() {
    framesCounter = 0;

    chip8.setupClearScreenFunction(clearCanvas);
    
    chip8.initialize();

    chip8.loadRomFromArray(romArray);

    setInterval(updateDrawEmulator, 16);

}

//Update game (one frame)
function updateDrawEmulator() {
    clearCanvas();
    chip8.cycle();
    draw();
}

function draw() {
    for (let x = 0; x < chip8.SCREEN_WIDTH; x++) {
        for(let y = 0; y < chip8.SCREEN_HEIGHT; y++) {
            let pixelDisplayBuffer = chip8.getDisplayBufferAt(x, y);
            if (pixelDisplayBuffer) {
                mainContext.fillRect(x * 10, y * 10, 10, 10);
            }
        }
    }
    
}


//globals ?
let mainCanvas = document.querySelector("canvas");
let mainContext = mainCanvas.getContext("2d");
let enterKeyReleased = false;
let framesCounter = 0, gameOver = false;

setupCanvas();
setupEvents();
initEmulator();
