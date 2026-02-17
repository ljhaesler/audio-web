import canvasSketch from "canvas-sketch";

const mySound = new Audio("explosion.wav");
const audioContext = new AudioContext();
const audioAnalyser = audioContext.createAnalyser();

const source = audioContext.createMediaElementSource(mySound);
source.connect(audioAnalyser);
audioAnalyser.connect(audioContext.destination);

const bufferLength = audioAnalyser.frequencyBinCount;
// audioAnalyser.fftSize = 16384;

const dataArray = new Uint8Array(bufferLength);

function sketch({ context, width, height, frame }) {
  const sliceWidth = width / bufferLength;

  context.fillStyle = "rgb(255 255 255)";
  context.fillRect(0, 0, width, height);

  // this is placed outside of the render loop
  // that way the lines are not overwritten on each loop

  return function render({ context, width, height, frame }) {
    audioAnalyser.getByteTimeDomainData(dataArray);

    // ------------ section will define a line across the canvas
    // beginPath, in tandem with stroke, defines and draws a single line
    // this lines style/shape can then be modified using various parameters
    context.beginPath();

    const max = Math.max(...dataArray);
    const min = Math.min(...dataArray);

    const maxDist128 = max - 128;
    const minDist128 = 128 - min;

    const color =
      maxDist128 > minDist128
        ? 255 - (maxDist128 * 2 - 1)
        : 255 - (minDist128 * 2 - 1);

    // '255 -' and '0 +' allow for fading to brighter and fading to darker respectively

    // const color =
    //   maxDist128 > minDist128
    //     ? 0 + (maxDist128 * 2 - 1)
    //     : 0 + (minDist128 * 2 - 1);

    if (maxDist128 > minDist128) {
      context.strokeStyle = `rgb(255 255 255)`;
    } else {
      context.strokeStyle = `rgb(${color} ${color} ${color})`;
    }
    context.lineWidth = 2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      // dataArray contains values that oscillate around 128
      // by dividing by 128, we can create a vector value to multiply the base y height by.
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
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    mySound.play();
    manager.togglePlay();

    document.addEventListener("click", () => {
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }
      mySound.play();
      manager.togglePlay();
    });
  },
);
