import canvasSketch from "canvas-sketch";

const audioElement = new Audio("audio-samples/sad-violin.mp3");
const audioContext = new AudioContext();

const audioAnalyserNode = audioContext.createAnalyser();
const audioSourceNode = audioContext.createMediaElementSource(audioElement);

audioSourceNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);
audioAnalyserNode.fftSize = 128;
const bufferLength = audioAnalyserNode.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);

function sketch({ context, width, height, frame }) {
  const sliceWidth = width / bufferLength;
  console.log(sliceWidth);

  return function render({ context, width, height, frame }) {
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
      context.strokeStyle = `rgb(${color} ${color} ${color})`;
    } else {
      context.strokeStyle = `rgb(${color} ${color} ${color})`;
    }
    context.lineWidth = 1;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = Math.abs(dataArray[i] - 128) / 128.0;
      const y = height - v * height;

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }

      x += sliceWidth;
    }

    context.stroke();
  };
}

canvasSketch(sketch, { dimensions: [2048, 512], animate: true }).then(
  (manager) => {
    document.addEventListener("click", () => {
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }
      audioElement.play();
    });
  },
);
