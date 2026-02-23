// Create canvas
const canvas = document.createElement("canvas");
const width = 4096;
const height = 1024;

canvas.width = width;
canvas.height = height;

document.body.appendChild(canvas);

const context = canvas.getContext("2d");
context.globalAlpha = 1.0;

async function requestBrowser() {
  try {
    const audioContext = new AudioContext();
    const userAudioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const audioSourceNode =
      audioContext.createMediaStreamSource(userAudioStream);
    const audioAnalyserNode = audioContext.createAnalyser();

    audioSourceNode.connect(audioAnalyserNode);
    audioAnalyserNode.connect(audioContext.destination);
    audioAnalyserNode.fftSize = 2048;

    const bufferLength = audioAnalyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sliceWidth = width / bufferLength;

    function render() {
      requestAnimationFrame(render);

      audioAnalyserNode.getByteFrequencyData(dataArray);

      // Calculate average for color
      const avg =
        dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      context.strokeStyle = `rgb(${avg + 64}, 0, 0)`;
      context.lineWidth = 2;

      context.beginPath();
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255;
        const y = height - v * height;

        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);

        x += sliceWidth;
      }
      context.stroke();
    }

    render();
  } catch (error) {
    console.log(error);
    console.log(navigator.mediaDevices);
  }
}

requestBrowser();
