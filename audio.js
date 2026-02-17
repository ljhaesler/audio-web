const mySound = new Audio("explosion.wav");
const audioContext = new AudioContext();
const audioAnalyser = audioContext.createAnalyser();

const source = audioContext.createMediaElementSource(mySound);
source.connect(audioAnalyser);
audioAnalyser.connect(audioContext.destination);

const bufferLength = audioAnalyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

const playButton = document.querySelector("button");
const audioCanvas = document.querySelector("canvas");
const ctx = audioCanvas.getContext("2d");

let animationId;

ctx.clearRect(0, 0, audioCanvas.width, audioCanvas.height);

function draw() {
  animationId = requestAnimationFrame(draw);
  audioAnalyser.getByteTimeDomainData(dataArray);

  console.log(dataArray);

  ctx.fillStyle = "rgb(230 230 230)";
  ctx.fillRect(0, 0, audioCanvas.width, audioCanvas.height);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgb(0 0 0)";
  ctx.beginPath();

  const sliceWidth = audioCanvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    // dataArray contains values that oscillate around 128
    // by dividing by 128, we can create a vector value to multiply the base y height by.
    // if dataArray[i] === 128 then y = audioCanvas.height / 2
    // else y = vector * audioCanvas.height / 2

    const v = dataArray[i] / 128.0;
    const y = v * (audioCanvas.height / 2);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(audioCanvas.width, audioCanvas.height / 2);
  ctx.stroke();
}

document.addEventListener("keydown", function (event) {
  if (event.key === "space") {
  }
});

playButton.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  if (playButton.dataset.playing === "false") {
    mySound.play();
    playButton.dataset.playing = "true";
  } else if (playButton.dataset.playing === "true") {
    mySound.pause();
    playButton.dataset.playing = "false";
  }
});

mySound.addEventListener("play", () => {
  draw();
});

mySound.addEventListener("pause", () => {
  cancelAnimationFrame(animationId);
});

mySound.addEventListener("ended", () => {
  playButton.dataset.playing = "false";
  cancelAnimationFrame(animationId);
});
