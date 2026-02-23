import canvasSketch from "canvas-sketch";

const audioElement = new Audio("audio-samples/sad-violin.mp3");
const audioContext = new AudioContext();

const audioAnalyserNode = audioContext.createAnalyser();
const audioSourceNode = audioContext.createMediaElementSource(audioElement);

audioSourceNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);

audioAnalyserNode.fftSize = 2048;
const bufferLength = audioAnalyserNode.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);

function sketch({ context, width, height, frame }) {
  const sliceWidth = height / bufferLength;

  context.fillRect(0, 0, width, height);

  return function render({ context, frame }) {
    audioAnalyserNode.getByteFrequencyData(dataArray);
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
  };
}

canvasSketch(sketch, {
  dimensions: [4096, 1024],
  animate: true,
  fps: 120,
}).then((manager) => {
  document.addEventListener("click", () => {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    audioElement.play();
  });
});
