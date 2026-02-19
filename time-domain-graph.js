import canvasSketch from "canvas-sketch";

const audioElement = new Audio("audio-samples/sad-violin.mp3");
const audioContext = new AudioContext();

// create our nodes from the AudioContext
const audioAnalyserNode = audioContext.createAnalyser();
const audioSourceNode = audioContext.createMediaElementSource(audioElement);

// connect the nodes together
// [audioSourceNode] -> [audioAnalyserNode] -> [destination (sound out)]
audioSourceNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);

audioAnalyserNode.fftSize = 4096;
const bufferLength = audioAnalyserNode.frequencyBinCount;

const dataArray = new Uint8Array(bufferLength);

function sketch({ context, width, height, frame }) {
  const sliceWidth = width / bufferLength;

  // unnecessary for a white background
  // context.fillStyle = "rgb(200 200 200)";
  // context.fillRect(0, 0, width, height);

  // this is placed outside of the render loop
  // that way the lines are not overwritten on each loop

  return function render({ context, width, height, frame }) {
    audioAnalyserNode.getByteTimeDomainData(dataArray);

    // ------------ section will define a line across the canvas
    // beginPath, in tandem with stroke, defines and draws a single line
    // this lines style/shape can then be modified using various parameters

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
      // dataArray contains values that oscillate around 128
      // by dividing by 128, we can create a vector value to multiply the base y height by
      // if dataArray[i] === 128 then y = height / 2
      // else y = vector * height / 2

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
    // ------------ section will sketch a line across the canvas
  };
}

canvasSketch(sketch, { dimensions: [2048, 512], animate: true, fps: 24 }).then(
  (manager) => {
    document.addEventListener("click", () => {
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }
      audioElement.play();
    });
  },
);
