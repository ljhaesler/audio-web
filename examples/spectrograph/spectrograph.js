// Create canvas
const canvas = document.createElement("canvas");
const width = 4096;
const height = 1024;

canvas.width = width;
canvas.height = height;

document.body.appendChild(canvas);

const context = canvas.getContext("2d");
context.fillRect(0, 0, width, height);
context.globalAlpha = 1.0;

// --- Audio Setup ---
const audioElement = new Audio("../../audio-samples/sad-violin.mp3");
const audioContext = new AudioContext();

const audioAnalyserNode = audioContext.createAnalyser();
const audioSourceNode = audioContext.createMediaElementSource(audioElement);

audioSourceNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);

audioAnalyserNode.fftSize = 2048;
const bufferLength = audioAnalyserNode.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// --- Animation State ---
let frame = 0;

function render() {
  requestAnimationFrame(render);
  frame++;

  audioAnalyserNode.getByteFrequencyData(dataArray);

  const sliceWidth = height / bufferLength;

  let x = frame;
  let y = height;

  context.beginPath();

  for (let i = 0; i < bufferLength; i++) {
    context.strokeStyle = `rgb(${dataArray[i]} 0 0)`;

    context.strokeRect(x, y, 1, 1);

    if (i === 0) context.moveTo(x, y);
    else context.lineTo(x, y);

    y -= sliceWidth;
  }

  context.stroke();
}

// --- Start Audio on Click (Browser Autoplay Policy) ---
document.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  audioElement.play();
});

render();
