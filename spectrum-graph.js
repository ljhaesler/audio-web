import canvasSketch from "canvas-sketch";

const audioElement = new Audio("audio-samples/rain.mp3");
let audioElementPlaying = false;
const audioContext = new AudioContext();

// create our nodes from the AudioContext
const audioAnalyserNode = audioContext.createAnalyser();
const audioSourceNode = audioContext.createMediaElementSource(audioElement);

// connect the nodes together
// [audioSourceNode] -> [audioAnalyserNode] -> [destination (sound out)]
audioSourceNode.connect(audioAnalyserNode);
audioAnalyserNode.connect(audioContext.destination);

audioAnalyserNode.fftSize = 512;
const bufferLength = audioAnalyserNode.frequencyBinCount;

// 5/6 will remove frequencies above 20000 hz
// these frequencies are almost always filtered out anyway.
const dataArray = new Uint8Array(bufferLength);

function sketch({ context, width, height, frame }) {
  // again, 1 / (5/6) = 1.2, to compensate for the loss of 20000 to 24000 hz
  // this will increase the width of the drawn spectrum graph.
  const sliceWidth = (width / bufferLength) * 1.2;

  let currentFrame = -1;
  // this is placed outside of the render loop
  // that way the lines are not overwritten on each loop

  return function render({ context, width, height, frame }) {
    currentFrame += 1;

    audioAnalyserNode.getByteFrequencyData(dataArray);
    context.beginPath();

    const avg =
      dataArray.reduce((acc, curr) => acc + curr, 0) / dataArray.length;
    context.strokeStyle = `rgb(${avg + 32} 0 ${frame})`;

    context.lineWidth = 1;
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
    // ------------ section will sketch a line across the canvas
  };
}

canvasSketch(sketch, {
  dimensions: [2048, 512],
  animate: true,
  fps: 4,
}).then((manager) => {
  document.addEventListener("click", () => {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    if (audioElementPlaying) {
      audioElement.pause();
      manager.pause();
      audioElementPlaying = false;
    } else {
      audioElement.play();
      manager.play();
      audioElementPlaying = true;
    }
  });
});
