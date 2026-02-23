import canvasSketch from "canvas-sketch";

const audioElement = new Audio("audio-samples/music2.mp3");
const audioContext = new AudioContext();

const audioAnalyserNode = audioContext.createAnalyser();
const audioSourceNode = audioContext.createMediaElementSource(audioElement);

audioSourceNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);

audioAnalyserNode.fftSize = 1024;
const bufferLength = audioAnalyserNode.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);

function sketch({ context, width, height, frame }) {
  const sliceWidth = (width / bufferLength) * 1.2;

  return function render({ context, width, height, frame }) {
    audioAnalyserNode.getByteFrequencyData(dataArray);
    context.beginPath();

    const avg =
      dataArray.reduce((acc, curr) => acc + curr, 0) / dataArray.length;
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
  };
}

canvasSketch(sketch, {
  dimensions: [2048, 512],
  animate: true,
}).then((manager) => {
  document.addEventListener("click", () => {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    audioElement.play();
  });
});
