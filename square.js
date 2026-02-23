import canvasSketch from "canvas-sketch";

const audioElement = new Audio("audio-samples/sad-violin.mp3");
const audioContext = new AudioContext();

const audioAnalyserNode = audioContext.createAnalyser();
const audioSourceNode = audioContext.createMediaElementSource(audioElement);

audioSourceNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);

audioAnalyserNode.fftSize = 8192;
const bufferLength = audioAnalyserNode.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);

function sketch({ context, width, height, frame }) {
  return function render({ context, width, height, frame }) {
    context.clearRect(0, 0, width, height);
    audioAnalyserNode.getByteFrequencyData(dataArray);

    let x = 0;
    let y = height;

    for (let i = 0; i < bufferLength; i++) {
      let colorValue = 255 - dataArray[i];

      context.fillStyle = `rgb(${colorValue} ${colorValue} ${colorValue})`;
      context.fillRect(x, y, 16, 16);

      if (x >= width - 16) {
        x = 0;
        y -= 16;
      } else {
        x += 16;
      }
    }
  };
}

canvasSketch(sketch, {
  dimensions: [1024, 1024],
  animate: true,
}).then((manager) => {
  document.addEventListener("click", () => {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    audioElement.play();
  });
});
