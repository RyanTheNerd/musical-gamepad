var gamepads = {};

function buttonPressed(b) {
  if (typeof(b) == "object") {
    return b.pressed;
  }
  return b == 1.0;
}

class Oscillator {
    constructor() {
        this.root = 220;
        this.ctx = new AudioContext();
        this.gain = this.ctx.createGain();
        this.oscillator = this.ctx.createOscillator();

        this.oscillator.connect(this.gain);
        this.gain.connect(this.ctx.destination);
    }
    setNote(halfSteps) {
        this.setFreq(Math.pow(2, halfSteps / 12) * this.root);
    }
    setGain(gain) {
        this.gain.gain.setValueAtTime(gain, this.ctx.currentTime);
    }
    setFreq(freq) {
        this.oscillator.frequency.setValueAtTime(freq, this.ctx.currentTime);
    }
    setWaveform(waveform) {
        this.oscillator.type = waveform;
    }
    start() {
        this.oscillator.start();
    }
}

class MainInterface {
    constructor(gamepadIndex) {
        this.waveforms = ["sine", "square", "sawtooth", "triangle"];
        this.roots = [110, 220, 440];
        this.rootIndex = 0;
        this.wfIndex = 0;
        this.voice = new Oscillator();
        this.gamepadIndex = gamepadIndex;

        this.voice.setGain(0.1);
        this.voice.setNote(0);
    }
    start() {
        this.voice.start();
        window.setInterval(this.mainLoop.bind(this), 10);
    }
    mainLoop() {
        let gamepad = navigator.getGamepads()[this.gamepadIndex];

        let buttonsPressed = false;

        let buttons = [0, 2, 3, 1, 4, 5, 6, 7];
        let notes = [0, 2, 4, 5, 7, 9, 11, 12];

        let pitchModifier = 0;

        if(buttonPressed(gamepad.buttons[12])) {
            pitchModifier = 1;
        }
        else if(buttonPressed(gamepad.buttons[13])) {
            pitchModifier = -1;
        }
        else if(gamepad.axes[1] != 0) {
            pitchModifier = -gamepad.axes[1] * 4;
        }
        for(let i = 0; i < 8; i++) {
            let buttonIndex = buttons[i];
            let note = notes[i];
            let button = gamepad.buttons[buttonIndex];
            if(buttonPressed(button)) {
                this.voice.setNote(note + pitchModifier);
                buttonsPressed = true;
            }
        }
        if(buttonPressed(gamepad.buttons[9])) {
            if(!this.wfButtonPreviouslyPressed) {
                this.wfIndex++;
                this.wfIndex %= this.waveforms.length;
                this.voice.setWaveform(this.waveforms[this.wfIndex]);
                this.wfButtonPreviouslyPressed = true;
            }
        }
        else {
            this.wfButtonPreviouslyPressed = false;
        }
        if(buttonPressed(gamepad.buttons[8])) {
            if(!this.rootButtonPreviouslyPressed) {
                this.rootIndex++;
                this.rootIndex %= this.roots.length;
                this.voice.root = this.roots[this.rootIndex];
                this.rootButtonPreviouslyPressed = true;
            }
        }
        else {
            this.rootButtonPreviouslyPressed = false;
        }
        if(buttonsPressed) this.voice.setGain(0.35);
        else if(!buttonsPressed) this.voice.setGain(0);
    }
}

document.body.querySelector("#start").addEventListener("click", () => {
    window.addEventListener("gamepadconnected", (e) => {
        let interface = new MainInterface(e.gamepad.index);
        interface.start();
    });

});
