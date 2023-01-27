const keyInputs = (new Array(16)).fill(0);
const SCREEN_WIDTH = 64;
const SCREEN_HEIGHT = 32;

const NUM_PIXELS = SCREEN_WIDTH * SCREEN_HEIGHT;
const DISPLAY_BUFFER = (new Array(NUM_PIXELS)).fill(0);
const MEMORY = (new Array(4096)).fill(0);
const GPIO = (new Array(16)).fill(0);//16 8-bit registers
let soundTimer = 0;
let delayTimer = 0;
let index = 0;//16-bit index register
let opCode = 0;
let pc = 0;//16-bit program counter
let stack = [];//stack pointer
let vx, vy;//registers adresses
let logging = 1;

let shouldDraw = 0;//boolean value

let funcMap = {
    0x0000 : _0ZZZ,
    0x00e0 : _0ZZ0,
    0x00ee : _0ZZE,
    0x1000 : _1ZZZ,
    0x6000 : _6ZZZ,
    0x7000 : _7ZZZ,
    0x8000 : _8ZZZ,
    0x8FF0 : _8ZZ0,
    0x8FF1 : _8ZZ1,
    0x8FF2 : _8ZZ2,
    0x8FF3 : _8ZZ3,
    0x8FF4 : _8ZZ4,
    0x8FF5 : _8ZZ5,
    0x8FF6 : _8ZZ6,
    0x8FF7 : _8ZZ7,
    0x8FFE : _8ZZE,
    0x9000 : _9ZZZ,
    0xA000 : _AZZZ,
    0xB000 : _BZZZ,
    0xC000 : _CZZZ,
    0xD000 : _DZZZ,
    0xE000 : _EZZZ,
    0xE00E : _EZZE,
    0xE001 : _EZZ1,
    0xF000 : _FZZZ,
    0xF007 : _FZ07,
    0xF00A : _FZ0A,
    0xF015 : _FZ15,
    0xF018 : _FZ18,
    0xF01E : _FZ1E,
    0xF029 : _FZ29,
    0xF033 : _FZ33,
    0xF055 : _FZ55,
    0xF065 : _FZ65
};

function logging(p) {
    let newLogging = p;
    let oldLogging = logging;
    if (newLogging) {
        logging = newLogging;
        return oldLogging;
    }
    return logging;
}

function logMessage(m) {
    if (logging) console.log(m);
}

function getRegisterValue(register) {
    return GPIO[register];
}

function setRegisterValue(register, value) {
    GPIO[register] = value;
}

function getPcValue() {
    return pc;
}

function getIndexValue() {
    return index;
}

function getDisplayBufferAt(x, y) {
    return DISPLAY_BUFFER[(64 * y + x) % NUM_PIXELS];
}

function getMEMORYAt(address) {
    return MEMORY[address];
}

function getKeyInput(key) {
    return keyInputs[key];
}

function setKeyInput(key) {
    return keyInputs[key] = 1;
}

function getDelayTimer() {
    return delayTimer;
}

function getSoundTimer() {
    return soundTimer;
}

function setDelayTimer(newDelayTimerValue) {
    delayTimer = newDelayTimerValue;
}

//chip8 instructions
function _0ZZZ() {
    let extracted_op = opCode & 0xf0ff;
    //we must regard for errors
    funcMap[extracted_op]();
}

function _0ZZ0() {
    logMessage("Clears screen");
    //maybe just fill the array with zeroes without creating another
    DISPLAY_BUFFER.forEach(() => 0);
    shouldDraw = 1;
}

function _0ZZE() {
    logMessage("returns from subroutine");
    pc = stack.pop();
}

function _1ZZZ() {
    logMessgae("jumps to address NNN");
    pc = opCode & 0x0fff;
}

function _2ZZZ() {
    
}

function _3ZZZ() {
    logMessgae("Skips the next instruction if Vx equals NN.");
    pc += (GPIO[vx] == (opCode & 0x00ff)) ? 2 : 0;
}

function _4ZZZ() {
    logMessgae("Skips the next instruction if VX doesn't equal NN.");
    pc += (GPIO[vx] != (opCode & 0x00ff)) ? 2 : 0;
}

function _5ZZZ() {
    logMessgae("Skips the next instruction if Vx == Vy");
    pc += (GPIO[vx] == GPIO[vy]) ? 2 : 0;
}

function _6ZZZ() {
    logMessgae("Sets Vx to NN");
    GPIO[vx] = opCode & 0xff;
}

function _7ZZZ() {
    let nn = opCode & 0x00ff;
    logMessgae("Adds NN(nn) to Vx(vx)");
    GPIO[vx] += nn;
    GPIO[vx] &= 0xff;
}

function _8ZZZ() {
    let extracted_op = opCode & 0xf00f;
    extracted_op += 0xff0;
    //look for errors
    funcMap[extracted_op]();
}

function _8ZZ0() {
    logMessgae("Sets Vx to the value of Vy");
    GPIO[vx] = GPIO[vy];
    //GPIO[vx] &= 0xff;
}

function _8ZZ1() {
    logMessgae("Sets Vx to Vx or Vy");
    GPIO[vx] |= GPIO[vy];
}

function _8ZZ2() {
    logMessgae("Set Vx = Vx AND Vy.");
    GPIO[vx] &= GPIO[vy];
}

function _8ZZ3() {
    logMessgae('Set Vx = Vx XOR Vy.');
    GPIO[vx] ^= GPIO[vy];
}

function _8ZZ4() {
    logMessgae("Adds VY to VX. VF is set to 1 when there's a carry, and to 0 when there isn't.");
    if (GPIO[vx] + GPIO[vy] > 0xff) {
        GPIO[0xf] = 1;
    }
    else {
        GPIO[0xf] = 0;
    }
    GPIO[vx] += GPIO[vy];
    GPIO[vx] &= 0xff;
    
}

function _8ZZ5() {
    logMessgae("VY is subtracted from VX. VF is set to 0 when there's a borrow, and 1 when there isn't");
    GPIO[0xf] = GPIO[vx] > GPIO[vy] ? 1 : 0;
    
    GPIO[vx] = GPIO[vx] - GPIO[vy];
    
    GPIO[vx] &= 0xff;
}

function _8ZZ6() {
    logMessgae('Set Vx = Vx SHR 1.  VF is set to the value of the least significant bit of VX before the shift.');
    GPIO[0xf] = GPIO[vx] & 0x0001;
    GPIO[vx] = GPIO[vx] >> 1;
}

function _8ZZ7() {
    logMessgae("Set Vx = Vy - Vx, set VF = NOT borrow.");
    GPIO[0xf] = GPIO[vy] > GPIO[vx] ? 1 : 0;
    GPIO[vx] = GPIO[vy] - GPIO[vx];
    GPIO[vx] &= 0xff;
}

function _8ZZE() {
    logMessgae("Set Vx = Vx SHL 1. VF is set to the value of the most significant bit of VX before the shift");
    GPIO[0xf] = GPIO[vx] >> 7;
    GPIO[vx] = GPIO[vx] << 1;
    GPIO[vx] &= 0xff;
}

function _9ZZZ() {
    logMessgae('Skip next instruction if Vx != Vy.');
    pc += (GPIO[vx] != GPIO[vy]) ? 2 : 0;
}

function _AZZZ() {
    logMessgae('Set I = nnn.');
    index = opCode & 0x0fff;
}

function _BZZZ() {
    logMessgae('Jump to location nnn + V0.');
    pc = (opCode & 0x0fff) + GPIO[0];
}

function _CZZZ() {
    logMessgae('Set Vx = random byte AND kk.');
    let random_byte = Math.floor(Math.random() * 256);// int rand(256);
    GPIO[vx] = random_byte & (opCode & 0xff);
    GPIO[vx] &= 0xff;
}

function _DZZZ() {
    logMessgae("Draw sprite...");
    let x = GPIO[vx] & 0xff;
    let y = GPIO[vy] & 0xff;
    
    let height = opCode & 0x000f;
    
    GPIO[0xf] = 0;
    
    let row = 0;
    while (row < height) {
        let byte = MEMORY[index + row];
        let pixel_offset = 0;
        while (pixel_offset < 8) {
            //the value of the bit in the sprite
            let bit = (byte >> pixel_offset) & 0x1;
            
            let current_pixel_x = (x + 7 - pixel_offset) % SCREEN_WIDTH;
            let current_pixel_y = ((y + row) % SCREEN_HEIGHT) * 64;
            
            //the value of the current pixel on screen
            let current_pixel = display_buffer[current_pixel_y +
                current_pixel_x];
            //current_pixel &= 0x1;
            
            if (bit && current_pixel) {
                GPIO[0xf] = 1;
            }
            
            display_buffer[current_pixel_y +
                current_pixel_x] = current_pixel ^ bit;
            
            pixel_offset++;
        }
        row += 1;
    }
    shouldDraw = 1;
    
}

function _EZZZ() {
    let extracted_op = opCode & 0xf00f;
    //treat errors when op not found
    funcMap[extracted_op]();
}

function _EZZE() {
    logMessgae('Skip next instruction if key with the value of Vx is pressed.');
    let key = GPIO[vx] & 0xf;
    pc += (keyInputs[key]) ? 2 : 0;
}

function _EZZ1() {
    logMessgae('Skip next instruction if key with the value of Vx is not pressed.');
    let key = GPIO[vx] & 0xf;
    pc += (keyInputs[key] == false) ? 2 : 0;
}

function _FZZZ() {
    let extracted_op = opCode & 0xf0ff;
    //treat errors when op not found
    funcMap[extracted_op]();
}

function _FZ07() {
    logMessgae('Set Vx = delay timer value.');
    GPIO[vx] = delayTimer;
}

function _FZ0A() {
    //TODO: write a test for this op code
    logMessgae('Wait for a key press, store the value of the key in Vx.');
    //TODO: get key here
    let key = -1;
    if (key >= 0) {
        GPIO[vx] = key;
    }
    else {
        pc -= 2;
    }
}

function _FZ15() {
    logMessgae('Set delay timer = Vx.');
    delayTimer = GPIO[vx];
}

function FZ18() {
    logMessgae('Set sound timer = Vx.');
    soundTimer = GPIO[vx];
}

function FZ1E() {
    logMessgae('Set I = I + Vx. if overflow Vf is set to 1');
    GPIO[0xf] = (index + GPIO[vx]) > 0xfff ? 1 : 0;
    index += GPIO[vx];
    index &= 0xfff;
}

function FZ29() {
    logMessgae("Set index to point to a character");
    index = (5 * GPIO[vx]) & 0xfff;
}

function FZ33() {
    logMessgae('Store BCD representation of Vx in MEMORY locations I, I+1, and I+2.');
    MEMORY[index] = int(GPIO[vx] / 100);
    MEMORY[index + 1] = int((GPIO[vx] % 100) / 10);
    MEMORY[index + 2] = GPIO[vx] % 10;
}

function FZ55() {
    logMessgae('Store registers V0 through Vx in MEMORY starting at location I.');
    let i = 0;
    while(i <= vx) {
        MEMORY[index + i] = GPIO[i];
        i = i + 1;
    }
    index = index + i + 1;
}

function FZ65() {
    logMessgae('Read registers V0 through Vx from MEMORY starting at location I.');
    let i = 0;
    while(i <= vx) {
        GPIO[i] = MEMORY[index + i];
        i = i + 1;
    }
    index = index + i + 1;
}

function clear() {
    //clear screen here
}

function loadRomFromFile(romPath) {
    //let (rom_path) = @_;
    logMessgae("Loading rom_path...");
    //open let rom_file, '<:raw', rom_path or die "Could not open rom file: !";
    let i = 0;
    while (1) {
        //let read_bytes = read rom_file, let byte, 1;
        //die "Error reading rom file:!" if not defined read_bytes;
        MEMORY[i + 0x200] = byte;
        i++;
        //last if not read_bytes;
    }
    //close rom_file;
}

function loadRomFromArray(bytesArray) {
    //let @bytes_array = @_;
    let size = bytesArray.length;
    logMessgae("Loading from array of bytes, array size: size bytes");
    for(let i = 0; i < size; i++) {
        MEMORY[i + 0x200] = byte;
    }
}

function cycle() {
    opCode = (MEMORY[pc] << 8) | MEMORY[pc + 1];
    
    vx = (opCode & 0x0f00) >> 8;
    vy = (opCode & 0x00f0) >> 4;
    
    
    //process the op code
    
    //After
    pc += 2;
    
    let extracted_op = opCode & 0xf000;
    if (funcMap[extracted_op]) {
        funcMap[extracted_op]();
    }
    else {
        logMessgae("Unknown instruction: opCode");
    }
    
    //decrement timers
    if (delayTimer > 0) {
        delayTimer -= 1;
    }
    if (soundTimer > 0) {
        soundTimer -= 1;
        if (soundTimer == 0) {
            //play sound here
        }
    }
    
    
}


function initialize(logging) {
    if (logging) {
        LOGGING = logging;
    }
    clear();
    MEMORY.fill(0);
    GPIO.fill(0);
    DISPLAY_BUFFER.fill(0);
    stack.length = 0;
    keyInputs.fill(0);
    opCode = 0;
    index = 0;
    
    delayTimer = 0;
    soundTimer = 0;
    shouldDraw = 0;
    
    pc = 0x200;
    
    for(let i = 0; i <= 79; i++) {
        //TODO: implement the get font byte
        //MEMORY[i] = Fonts::get_font_byte(i);
    }
    
}

//chip8 instructions
function _0ZZZ() {
    let extractedOp = opCode & 0xf0ff;
    //we must regard for errors
    funcMap[extractedOp]();
}



export {SCREEN_WIDTH, DISPLAY_BUFFER};