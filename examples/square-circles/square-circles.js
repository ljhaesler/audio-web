// Setup canvas
const canvas = document.createElement("canvas");
const width = 1024;
const height = 1024;

canvas.width = width;
canvas.height = height;

document.body.appendChild(canvas);

const context = canvas.getContext("2d");
context.globalAlpha = 1.0;

// Setup audio
const audioElement = new Audio("../../audio-samples/music2.mp3");
const audioContext = new AudioContext();

const audioAnalyserNode = audioContext.createAnalyser();
const audioSourceNode = audioContext.createMediaElementSource(audioElement);

audioSourceNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);

audioAnalyserNode.fftSize = 8192;
const bufferLength = audioAnalyserNode.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);

function render() {
  requestAnimationFrame(render);

  context.clearRect(0, 0, width, height);
  audioAnalyserNode.getByteFrequencyData(dataArray);

  let x = 8;
  let y = height - 8;

  for (let i = 0; i < bufferLength; i++) {
    let colorValue = 255 - dataArray[i];

    context.fillStyle = `rgb(${colorValue} ${colorValue} ${colorValue})`;

    context.beginPath();
    context.arc(x, y, 8, 0, 2 * Math.PI);
    context.fill();
    if (x >= width - 16) {
      x = 8;
      y -= 16;
    } else {
      x += 16;
    }
  }
}

document.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  audioElement.play();
});

render();
