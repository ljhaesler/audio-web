import canvasSketch from "canvas-sketch";

const audioElement = new Audio("audio-samples/explosion.wav");
const audioContext = new AudioContext();

const audioAnalyserNode = audioContext.createAnalyser();
const audioSourceNode = audioContext.createMediaElementSource(audioElement);

audioSourceNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);

audioAnalyserNode.fftSize = 8192;
const bufferLength = audioAnalyserNode.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);

function sketch({ context, width, height, frame }) {
  let lastFrame = -1;
  return function render({ context, width, height, frame }) {
    if (lastFrame < frame) {
      lastFrame = frame;

      context.clearRect(0, 0, width, height);
      audioAnalyserNode.getByteTimeDomainData(dataArray);

      let x = 8;
      let y = 8;

      for (let i = 0; i < bufferLength; i++) {
        let colorValue = 255 - Math.abs(dataArray[i] - 128) * 2;

        context.fillStyle = `rgb(${colorValue} ${colorValue} ${colorValue})`;
        context.beginPath();
        context.arc(x, y, 4, 0, 2 * Math.PI);
        context.fill();
        if (x >= width - 16) {
          x = 8;
          y += 16;
        } else {
          x += 16;
        }
      }
    }
  };
}

canvasSketch(sketch, { dimensions: [1024, 1024], animate: true, fps: 18 }).then(
  (manager) => {
    document.addEventListener("click", () => {
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }
      audioElement.play();
    });
  },
);
