import canvasSketch from "canvas-sketch";

const audioElement = new Audio("audio-samples/music.mp3");
const audioContext = new AudioContext();

// create our nodes from the AudioContext
const audioAnalyserNode = audioContext.createAnalyser();
const audioSourceNode = audioContext.createMediaElementSource(audioElement);

// connect the nodes together
// [audioSourceNode] -> [audioAnalyserNode] -> [destination (sound out)]
audioSourceNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);

const bufferLength = audioAnalyserNode.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);

function sketch({ context, width, height, frame }) {
  const sliceWidth = width / bufferLength;

  // this is placed outside of the render loop
  // that way the lines are not overwritten on each loop

  return function render({ context, width, height, frame }) {
    audioAnalyserNode.getByteFrequencyData(dataArray);
    context.beginPath();

    const max = Math.max(...dataArray);

    context.strokeStyle = `rgb(${255 - max} ${255 - max} ${255 - max})`;

    context.lineWidth = 1;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 256;
      const y = height - v * height;

      if (i === 0) {
        context.moveTo(x, height);
      } else {
        context.lineTo(x, y);
      }

      x += sliceWidth;
    }

    context.stroke();
    // ------------ section will sketch a line across the canvas
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
