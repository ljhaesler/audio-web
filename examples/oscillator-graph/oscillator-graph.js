// Canvas setup
const canvas = document.createElement("canvas");
const width = 4096;
const height = 1024;
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
const context = canvas.getContext("2d");
context.globalAlpha = 1.0;

// Audio setup
const audioContext = new AudioContext();
const audioAnalyserNode = audioContext.createAnalyser();
const gainNode = audioContext.createGain();
const oscillatorNodeTriangle = audioContext.createOscillator();
const oscillatorNodeSquare = audioContext.createOscillator();
const oscillatorNodeSine = audioContext.createOscillator();

oscillatorNodeTriangle.type = "triangle";
oscillatorNodeTriangle.start();
oscillatorNodeSquare.type = "square";
oscillatorNodeSquare.start();
oscillatorNodeSine.type = "sine";
oscillatorNodeSine.start();

let squareWaveFrequency = 0;
let triangleWaveFrequency = 0;
let sineWaveFrequency = 0;

oscillatorNodeSquare.connect(gainNode);
oscillatorNodeTriangle.connect(gainNode);
oscillatorNodeSine.connect(gainNode);
gainNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);

// Connect to HTML inputs
document.getElementById("squareWaveSlider").addEventListener("input", (e) => {
  squareWaveFrequency = parseFloat(e.target.value);
  document.getElementById("squareWaveLabel").textContent =
    `Square Wave: ${squareWaveFrequency} hz`;
});

document.getElementById("triangleWaveSlider").addEventListener("input", (e) => {
  triangleWaveFrequency = parseFloat(e.target.value);
  document.getElementById("triangleWaveLabel").textContent =
    `Triangle Wave: ${triangleWaveFrequency} hz`;
});

document.getElementById("sineWaveSlider").addEventListener("input", (e) => {
  sineWaveFrequency = parseFloat(e.target.value);
  document.getElementById("sineWaveLabel").textContent =
    `Sine Wave: ${sineWaveFrequency} hz`;
});

document.getElementById("fftSizeDropdown").addEventListener("change", (e) => {
  audioAnalyserNode.fftSize = e.target.value;
  bufferLength = audioAnalyserNode.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  sliceWidth = width / bufferLength;
  document.getElementById("fftSizeLabel").textContent =
    "FFT Size: " + e.target.value;
});

let bufferLength = audioAnalyserNode.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);
let sliceWidth = width / bufferLength;

function render() {
  requestAnimationFrame(render);
  audioAnalyserNode.getByteFrequencyData(dataArray);

  oscillatorNodeTriangle.frequency.value = triangleWaveFrequency;
  oscillatorNodeSquare.frequency.value = squareWaveFrequency;
  oscillatorNodeSine.frequency.value = sineWaveFrequency;

  context.beginPath();

  const avg = dataArray.reduce((acc, curr) => acc + curr, 0) / dataArray.length;
  context.strokeStyle = `rgb(${avg} 0 0)`;
  context.lineWidth = 1;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 256;
    const y = height - v * height;

    if (i === 0) {
      context.moveTo(x, height);
    } else {
      context.lineTo(x, y);
    }

    x += sliceWidth;
  }

  context.stroke();
}

document.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
});

render();
