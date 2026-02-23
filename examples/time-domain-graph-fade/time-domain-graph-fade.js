class ColorPath2D extends Path2D {
  setColor(color) {
    this.color = color;
  }

  getColor() {
    return this.color;
  }
}

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

audioAnalyserNode.fftSize = 16384;
const bufferLength = audioAnalyserNode.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);
const sliceWidth = width / bufferLength;

context.fillStyle = "rgb(0 0 0)";
const paths = [];

function render() {
  requestAnimationFrame(render);

  audioAnalyserNode.getByteTimeDomainData(dataArray);
  context.fillRect(0, 0, width, height);
  const path = new ColorPath2D();

  const max = Math.max(...dataArray);
  const min = Math.min(...dataArray);

  const maxDist128 = max - 128;
  const minDist128 = Math.abs(min - 128);

  const color =
    maxDist128 > minDist128
      ? 255 - (maxDist128 * 2 + 1)
      : 255 - (minDist128 * 2 + 1);

  if (maxDist128 > minDist128) {
    path.setColor(`rgb(255 ${color} 255 )`);
  } else {
    path.setColor(`rgb(255 255 ${color})`);
  }

  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }

    x += sliceWidth;
  }

  if (paths.length >= 32) paths.shift();
  paths.push(path);

  paths.forEach((el) => {
    context.strokeStyle = el.getColor();
    context.stroke(el);
  });
}

document.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  audioElement.play();
});

render();
