// Create canvas
const canvas = document.createElement("canvas");
const width = 4096;
const height = 1024;

canvas.width = width;
canvas.height = height;

document.body.appendChild(canvas);

const context = canvas.getContext("2d");
context.globalAlpha = 1.0;

// Setup audio
const audioElement = new Audio("../../audio-samples/music.mp3");
const audioContext = new AudioContext();

const audioAnalyserNode = audioContext.createAnalyser();
const audioSourceNode = audioContext.createMediaElementSource(audioElement);

audioSourceNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);

audioAnalyserNode.fftSize = 8192;
const bufferLength = audioAnalyserNode.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);
const sliceWidth = width / bufferLength;

function render() {
  requestAnimationFrame(render);

  audioAnalyserNode.getByteTimeDomainData(dataArray);
  context.beginPath();

  const max = Math.max(...dataArray);
  const min = Math.min(...dataArray);

  const maxDist128 = max - 128;
  const minDist128 = Math.abs(min - 128);

  const color =
    maxDist128 > minDist128
      ? 255 - (maxDist128 * 2 + 1)
      : 255 - (minDist128 * 2 + 1);

  if (maxDist128 > minDist128) {
    context.strokeStyle = `rgb(255 ${color} ${color})`;
  } else {
    context.strokeStyle = `rgb(${color} ${color} 255)`;
  }
  context.lineWidth = 1;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      context.moveTo(x, y);
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
