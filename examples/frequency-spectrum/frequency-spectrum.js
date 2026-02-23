// Setup canvas
const canvas = document.createElement("canvas");
const width = 4096;
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

audioAnalyserNode.fftSize = 1024;
const bufferLength = audioAnalyserNode.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);
const sliceWidth = (width / bufferLength) * 1.2;

function render() {
  requestAnimationFrame(render);

  audioAnalyserNode.getByteFrequencyData(dataArray);
  context.beginPath();

  const avg = dataArray.reduce((acc, curr) => acc + curr, 0) / dataArray.length;
  context.strokeStyle = `rgb(${avg + 32} 0 0)`;

  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 255;
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
  audioElement.play();
});

render();
